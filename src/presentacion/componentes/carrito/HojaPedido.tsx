"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bike,
  Check,
  Clock3,
  CupSoda,
  MapPin,
  MessageCircle,
  Minus,
  Pencil,
  Plus,
  ShoppingBag,
  Smartphone,
  Star,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCarritoStore } from "@/store/carrito.store";
import type { ItemCarrito } from "@/types/carrito";
import type { Negocio } from "@/types/negocio";
import type { Producto } from "@/types/producto";
import { GRUPOS_ADICIONES } from "@/config/adiciones";
import { calcularDomicilio } from "@/dominio/domicilios/calcularDomicilio";
import {
  obtenerNotaWhatsAppSegunEstado,
  type ResultadoEstadoNegocio,
} from "@/dominio/horarios/obtenerEstadoNegocio";
import { procesarDireccionUsuario } from "@/dominio/domicilios/parseDireccion";
import { construirEnlaceGoogleMaps } from "@/utils/construirEnlaceGoogleMaps";
import {
  guardarCliente,
  leerCliente,
  olvidarCliente,
  tieneDatosCliente,
} from "@/aplicacion/cliente/clienteRecordado";
import { Hoja } from "@/presentacion/componentes/comunes/Hoja";
import { Foto } from "@/presentacion/componentes/comunes/Foto";
import { FirmaQuickFlow } from "@/presentacion/componentes/comunes/FirmaQuickFlow";
import { MosaicoProducto } from "@/presentacion/componentes/catalogo/TarjetaProducto";
import { nombreVisible, pesos } from "@/presentacion/utilidades/formato";
import { InputDireccionAutocomplete } from "./InputDireccionAutocomplete";

export type PasoPedido = 1 | 2 | 3;
type TipoEntrega = "domicilio" | "recoger";
type MetodoPago = "efectivo" | "transferencia" | "mixto";
type Campo = "nombre" | "telefono" | "direccion" | "montos";

interface Props {
  abierta: boolean;
  paso: PasoPedido;
  onCambiarPaso: (paso: PasoPedido) => void;
  onCerrar: () => void;
  onEditarItem: (item: ItemCarrito) => void;
  onAgregarBebida: (producto: Producto) => void;
  onElegirProducto: (producto: Producto) => void;
  negocio: Negocio;
  estadoNegocio: ResultadoEstadoNegocio;
  bebidas: Producto[];
  // Más pedidos que todavía no están en el pedido
  sugeridos: Producto[];
}

export function HojaPedido({
  abierta,
  paso,
  onCambiarPaso,
  onCerrar,
  onEditarItem,
  onAgregarBebida,
  onElegirProducto,
  negocio,
  estadoNegocio,
  bebidas,
  sugeridos,
}: Props) {
  const items = useCarritoStore((s) => s.items);
  const actualizarItem = useCarritoStore((s) => s.actualizarItem);
  const eliminarItem = useCarritoStore((s) => s.eliminarItem);
  const limpiarCarrito = useCarritoStore((s) => s.limpiar);

  // Datos del último pedido en este dispositivo: el cliente no los escribe dos veces
  const [recordado] = useState(leerCliente);
  const [usaRecordado, setUsaRecordado] = useState(() =>
    tieneDatosCliente(recordado),
  );

  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>(
    recordado.tipoEntrega,
  );
  const [nombre, setNombre] = useState(recordado.nombre);
  const [telefono, setTelefono] = useState(recordado.telefono);
  const [direccion, setDireccion] = useState(recordado.direccion);
  const [indicacionesEntrega, setIndicacionesEntrega] = useState(
    recordado.indicaciones,
  );
  const [comentarioPedido, setComentarioPedido] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(
    recordado.metodoPago,
  );
  const [montoTransferencia, setMontoTransferencia] = useState("");
  const [montoEfectivo, setMontoEfectivo] = useState("");

  // Campos que faltaron al intentar enviar; el contador reinicia la sacudida
  const [revision, setRevision] = useState<{
    campos: Campo[];
    horario: boolean;
    intento: number;
  }>({ campos: [], horario: false, intento: 0 });
  const [quitado, setQuitado] = useState<{
    item: ItemCarrito;
    indice: number;
  } | null>(null);
  const [enviado, setEnviado] = useState<{
    url: string;
    total: number;
    tipoEntrega: TipoEntrega;
  } | null>(null);

  const subtotalProductos = items.reduce((acc, item) => acc + item.total, 0);
  const unidades = items.reduce((acc, item) => acc + item.cantidad, 0);

  const analisisDireccion = useMemo(
    () => procesarDireccionUsuario(direccion),
    [direccion],
  );

  const resultadoDomicilio = useMemo(() => {
    if (tipoEntrega !== "domicilio") {
      return {
        estado: "OK" as const,
        zona: "",
        valor: 0,
        requiereConfirmacion: false,
        mensaje: "",
        calle: null as number | null,
        carrera: null as number | null,
      };
    }

    const direccionCalculo =
      analisisDireccion.direccionInterpretada.trim().length > 0
        ? analisisDireccion.direccionInterpretada
        : direccion;

    const calle = analisisDireccion.calle;
    const carrera = analisisDireccion.carrera;

    const resultado = calcularDomicilio({
      direccion: direccionCalculo,
    });

    return {
      estado: "OK" as const,
      zona: resultado.zona,
      valor: resultado.valor,
      requiereConfirmacion: resultado.requiereConfirmacion,
      mensaje: resultado.mensaje,
      calle,
      carrera,
    };
  }, [
    analisisDireccion.calle,
    analisisDireccion.carrera,
    analisisDireccion.direccionInterpretada,
    direccion,
    tipoEntrega,
  ]);

  const direccionFinal =
    analisisDireccion.direccionInterpretada.trim().length > 0
      ? analisisDireccion.direccionInterpretada
      : direccion.trim();

  const esDomicilioFallback =
    tipoEntrega === "domicilio" && resultadoDomicilio.requiereConfirmacion;

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    if (tipoEntrega !== "domicilio" || direccion.trim().length === 0) {
      return;
    }

    console.debug("[Domicilio][Debug]", {
      direccionRecibida: direccion,
      textoNormalizado: analisisDireccion.textoNormalizado,
      direccionInterpretada: analisisDireccion.direccionInterpretada,
      calleExtraida: analisisDireccion.calle,
      carreraExtraida: analisisDireccion.carrera,
      zonaDetectada: resultadoDomicilio.zona,
      valorDomicilio: resultadoDomicilio.valor,
      motivo: resultadoDomicilio.mensaje,
    });
  }, [
    analisisDireccion.calle,
    analisisDireccion.carrera,
    analisisDireccion.direccionInterpretada,
    analisisDireccion.textoNormalizado,
    direccion,
    resultadoDomicilio.mensaje,
    resultadoDomicilio.valor,
    resultadoDomicilio.zona,
    tipoEntrega,
  ]);

  const valorDomicilio = esDomicilioFallback ? 0 : resultadoDomicilio.valor;
  const totalFinal = subtotalProductos + valorDomicilio;
  const hayDireccion = direccion.trim().length > 0;

  const salsasPorId = new Map(
    GRUPOS_ADICIONES.salsas.opciones.map((opcion) => [
      opcion.id,
      opcion.nombre,
    ]),
  );

  const nombreValido = nombre.trim().length > 0;
  const telefonoValido = telefono.replace(/\D/g, "").length >= 10;
  const direccionValida =
    tipoEntrega === "recoger" || direccionFinal.length > 0;

  const metodoMixtoValido =
    metodoPago !== "mixto" ||
    (montoTransferencia.trim().length > 0 && montoEfectivo.trim().length > 0);

  const envioBloqueadoPorHorario =
    !estadoNegocio.estaAbierto ||
    (tipoEntrega === "domicilio" && !estadoNegocio.puedeRecibirDomicilios);

  const idsBebidas = new Set(bebidas.map((bebida) => bebida.id));
  const esBebida = (item: ItemCarrito) => idsBebidas.has(item.productoId);
  const unidadesDe = (productoId: string) =>
    items
      .filter((item) => item.productoId === productoId)
      .reduce((acc, item) => acc + item.cantidad, 0);

  const platos = items
    .filter((item) => !esBebida(item))
    .reduce((acc, item) => acc + item.cantidad, 0);

  // Con dos o más platos se ofrece primero la bebida más grande, para compartir
  const bebidasSugeridas =
    platos >= 2
      ? [...bebidas].sort((a, b) => b.precio - a.precio)
      : bebidas;

  const quitarMarca = (campo: Campo) =>
    setRevision((previa) => ({
      ...previa,
      campos: previa.campos.filter((item) => item !== campo),
    }));

  const cambiarCantidad = (item: ItemCarrito, delta: number) => {
    const cantidad = item.cantidad + delta;

    if (cantidad <= 0) {
      setQuitado({ item, indice: items.indexOf(item) });
      eliminarItem(item.id);
      return;
    }

    setQuitado(null);
    actualizarItem(item.id, {
      ...item,
      cantidad,
      total: (item.total / item.cantidad) * cantidad,
    });
  };

  const deshacerQuitado = () => {
    if (!quitado) {
      return;
    }

    useCarritoStore.setState((estado) => ({
      items: [
        ...estado.items.slice(0, quitado.indice),
        quitado.item,
        ...estado.items.slice(quitado.indice),
      ],
    }));
    setQuitado(null);
  };

  const cambiarTipoEntrega = (tipo: TipoEntrega) => {
    setTipoEntrega(tipo);
    guardarCliente({ tipoEntrega: tipo });
  };

  const cambiarMetodoPago = (metodo: MetodoPago) => {
    setMetodoPago(metodo);
    guardarCliente({ metodoPago: metodo });
    quitarMarca("montos");
  };

  const cambiarDireccion = (valor: string) => {
    setDireccion(valor);
    guardarCliente({ direccion: valor });
    quitarMarca("direccion");
  };

  const borrarDatosRecordados = () => {
    olvidarCliente();
    setUsaRecordado(false);
    setNombre("");
    setTelefono("");
    setDireccion("");
    setIndicacionesEntrega("");
  };

  const generarMensaje = () => {
    const telefonoLimpio = telefono.replace(/\D/g, "");

    const tipoEntregaLabel =
      tipoEntrega === "domicilio" ? "Domicilio" : "Recoger en tienda";

    const metodoPagoLabel =
      metodoPago === "efectivo"
        ? "Efectivo"
        : metodoPago === "transferencia"
          ? "Transferencia"
          : "Mixto";

    const indicacionesEntregaLimpias = indicacionesEntrega.trim();
    const comentarioPedidoLimpio = comentarioPedido.trim();

    const notaOperativa = obtenerNotaWhatsAppSegunEstado(
      estadoNegocio,
      tipoEntrega,
    );

    let mensaje = "";

    mensaje += "🍟 *MANDINGAS LA 37*\n";
    mensaje += "🚀 Pedido recibido\n\n";

    mensaje += `👤 ${nombre.trim()}\n`;
    mensaje += `📞 ${telefonoLimpio}\n\n`;

    mensaje += `📍 ${tipoEntregaLabel}\n`;

    if (notaOperativa) {
      mensaje += `🕐 ${notaOperativa}\n`;
    }

    if (tipoEntrega === "domicilio") {
      mensaje += `📌 ${direccionFinal}\n`;

      if (resultadoDomicilio.estado === "OK") {
        mensaje += `${resultadoDomicilio.zona}\n`;
      }

      if (direccionFinal.length > 0) {
        const enlaceMaps = construirEnlaceGoogleMaps({
          direccion: direccionFinal,
        });

        if (enlaceMaps) {
          mensaje += `🗺️ ${enlaceMaps}\n`;
        }
      }
    }

    mensaje += "\n";

    if (tipoEntrega === "domicilio") {
      mensaje += indicacionesEntregaLimpias
        ? `📝 ${indicacionesEntregaLimpias}\n`
        : "📝 Sin indicaciones de entrega\n";
    }

    mensaje += comentarioPedidoLimpio
      ? `🍳 ${comentarioPedidoLimpio}\n`
      : "🍳 Sin comentarios\n";

    if (esDomicilioFallback) {
      mensaje += `⚠️ ${resultadoDomicilio.mensaje}\n`;
      mensaje += "⚠️ El valor final de domicilio se confirma con la tienda\n";
    }

    mensaje += "\n";
    mensaje += "🧺 *Pedido:*\n";

    items.forEach((item) => {
      mensaje += `• ${item.nombre} x${item.cantidad}\n`;

      if (item.salsas.length > 0) {
        const salsas = item.salsas.map((id) => salsasPorId.get(id) ?? id);
        mensaje += `  + Salsas: ${salsas.join(", ")}\n`;
      }

      item.adiciones.forEach((adicion) => {
        mensaje += `  + ${adicion.nombre} x${adicion.cantidad}\n`;
      });

      mensaje += `  + Valor: ${pesos(item.total)}\n`;
    });

    mensaje += "\n";
    mensaje += `💳 ${metodoPagoLabel}\n`;

    if (metodoPago === "mixto") {
      mensaje += `Transferencia: $${montoTransferencia.trim()}\n`;
      mensaje += `Efectivo: $${montoEfectivo.trim()}\n`;
    }

    mensaje += "\n";
    mensaje += `🧺 Productos: *${pesos(subtotalProductos)}*\n`;

    if (tipoEntrega === "domicilio") {
      mensaje += esDomicilioFallback
        ? "🛵 Domicilio: Por confirmar\n"
        : `🛵 Domicilio: ${pesos(valorDomicilio)}\n`;
    }

    mensaje += `\n💰 Total: *${pesos(totalFinal)}*\n`;
    mensaje += "\n🕐 Te confirmamos en breve 🙌";

    return mensaje;
  };

  const enviarPedido = () => {
    const campos: Campo[] = [];

    if (!nombreValido) campos.push("nombre");
    if (!telefonoValido) campos.push("telefono");
    if (!direccionValida) campos.push("direccion");
    if (!metodoMixtoValido) campos.push("montos");

    if (envioBloqueadoPorHorario || campos.length > 0) {
      setRevision((previa) => ({
        campos,
        horario: envioBloqueadoPorHorario,
        intento: previa.intento + 1,
      }));
      return;
    }

    const whatsappDestino = negocio.whatsapp.replace(/\D/g, "");

    if (!whatsappDestino) {
      return;
    }

    const url = `https://wa.me/${whatsappDestino}?text=${encodeURIComponent(
      generarMensaje(),
    )}`;

    track("click_whatsapp", {
      negocio: negocio.nombre?.trim() || "mandingas-la-37",
      origen: "modal_carrito",
      tipo_entrega: tipoEntrega,
      metodo_pago: metodoPago,
      total: totalFinal,
      cantidad_items: items.length,
      horario_abierto: estadoNegocio.estaAbierto ? "si" : "no",
      domicilio_requiere_confirmacion: esDomicilioFallback ? "si" : "no",
    });

    window.open(url, "_blank", "noopener,noreferrer");

    guardarCliente({
      nombre: nombre.trim(),
      telefono,
      direccion,
      indicaciones: indicacionesEntrega,
      tipoEntrega,
      metodoPago,
    });
    setUsaRecordado(true);
    setRevision({ campos: [], horario: false, intento: 0 });
    setEnviado({ url, total: totalFinal, tipoEntrega });
    onCambiarPaso(3);
  };

  const terminar = () => {
    limpiarCarrito();
    setComentarioPedido("");
    setMontoTransferencia("");
    setMontoEfectivo("");
    setQuitado(null);
    setEnviado(null);
    onCambiarPaso(1);
    onCerrar();
  };

  const cuerpoRef = useRef<HTMLDivElement | null>(null);

  // Tras un intento fallido, la pantalla va al primer dato que falta
  useEffect(() => {
    if (revision.intento === 0) {
      return;
    }

    const objetivo = cuerpoRef.current?.querySelector<HTMLElement>(
      ".aviso.mal, .campo.mal",
    );

    objetivo?.scrollIntoView({ behavior: "smooth", block: "center" });
    objetivo?.querySelector("input")?.focus({ preventScroll: true });
  }, [revision.intento]);

  const claseCampo = (campo: Campo) =>
    `campo${revision.campos.includes(campo) ? " mal" : ""}`;

  // La clave cambia solo en cada intento de envío: el campo con error vuelve a
  // sacudirse, pero no se reinicia mientras el cliente escribe
  const claveCampo = (campo: Campo) => `${campo}-${revision.intento}`;

  const cabecera = (titulo: string, conVolver?: boolean) => (
    <div className="c-tit">
      {conVolver && (
        <button
          type="button"
          className="rnd"
          onClick={() => onCambiarPaso(1)}
          aria-label="Volver al pedido"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
      )}
      <h2>{titulo}</h2>
      <button
        type="button"
        className="rnd"
        onClick={onCerrar}
        aria-label="Cerrar"
      >
        <X size={20} aria-hidden="true" />
      </button>
    </div>
  );

  const aviso = estadoNegocio.estado !== "abierto" && (
    <div
      key={revision.horario ? `aviso-${revision.intento}` : "aviso"}
      className={`aviso${revision.horario ? " mal" : ""}`}
      role="status"
    >
      {negocio.anfitriona ? (
        <img
          className="av c30"
          src={negocio.anfitriona.cara}
          alt=""
          width={192}
          height={192}
        />
      ) : (
        <Clock3 size={20} aria-hidden="true" />
      )}
      <span>{estadoNegocio.mensaje}</span>
    </div>
  );

  const filaDeshacer = quitado && (
    <div key="deshacer" className="desh">
      <span>
        Quitaste <b>{nombreVisible(quitado.item.nombre)}</b>
      </span>
      <button type="button" onClick={deshacerQuitado}>
        Deshacer
      </button>
    </div>
  );

  let contenido: React.ReactNode;

  if (paso === 3 && enviado) {
    contenido = (
      <>
        <div className="cuerpo">
          <div className="listo">
            <div className="escena">
              {negocio.anfitriona && (
                <img
                  className="av"
                  src={negocio.anfitriona.busto}
                  alt=""
                  width={400}
                  height={400}
                />
              )}
              <span className="ins ok">
                <Check size={22} aria-hidden="true" />
              </span>
            </div>
            <h3>¡Pedido listo!</h3>
            <p className="res num">
              {pesos(enviado.total)} ·{" "}
              {enviado.tipoEntrega === "domicilio"
                ? "Domicilio"
                : "Recoger en tienda"}
            </p>
            <p>
              Abrimos WhatsApp con tu pedido ya escrito. Envía el mensaje y te
              confirmamos en breve.
            </p>
            <a
              className="i-sec"
              href={enviado.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp otra vez
            </a>
            <FirmaQuickFlow />
          </div>
        </div>
        <div className="pie col">
          <button type="button" className="cta" onClick={terminar}>
            Volver al menú
          </button>
        </div>
      </>
    );
  } else if (items.length === 0) {
    contenido = (
      <>
        {cabecera("Tu pedido")}
        <div className="cuerpo">
          {aviso}
          {filaDeshacer}
          <div className="vacio">
            <div className="escena">
              {negocio.anfitriona && (
                <img
                  className="av"
                  src={negocio.anfitriona.busto}
                  alt=""
                  width={400}
                  height={400}
                />
              )}
              <span className="ins">
                <ShoppingBag size={20} aria-hidden="true" />
              </span>
            </div>
            Tu pedido está vacío.
            <br />
            Toca un producto para agregarlo.
          </div>
        </div>
      </>
    );
  } else if (paso === 1) {
    const filas = items.map((item) => {
      const bebida = esBebida(item);
      const nombreItem = nombreVisible(item.nombre);

      return (
        <div key={item.id} className="it">
          <Foto src={item.imagen} completa={bebida} prioritaria />

          <div>
            <b>{nombreItem}</b>
            {(item.salsas.length > 0 || item.adiciones.length > 0) && (
              <div className="tags">
                {item.salsas.map((id) => (
                  <span key={id}>{salsasPorId.get(id) ?? id}</span>
                ))}
                {item.adiciones.map((adicion) => (
                  <span key={adicion.id} className="ex">
                    + {adicion.cantidad > 1 ? `${adicion.cantidad} × ` : ""}
                    {adicion.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pr num">{pesos(item.total)}</div>

          <div className="ctl">
            <div className="qty">
              <button
                type="button"
                className={item.cantidad === 1 ? "del" : ""}
                onClick={() => cambiarCantidad(item, -1)}
                aria-label={
                  item.cantidad === 1
                    ? `Quitar ${nombreItem}`
                    : `Uno menos de ${nombreItem}`
                }
              >
                {item.cantidad === 1 ? (
                  <Trash2 size={18} aria-hidden="true" />
                ) : (
                  <Minus size={18} aria-hidden="true" />
                )}
              </button>
              <output className="num">{item.cantidad}</output>
              <button
                type="button"
                onClick={() => cambiarCantidad(item, 1)}
                aria-label={`Uno más de ${nombreItem}`}
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>

            {!bebida && (
              <button
                type="button"
                className="edit"
                onClick={() => onEditarItem(item)}
              >
                <Pencil size={16} aria-hidden="true" /> Cambiar
              </button>
            )}
          </div>
        </div>
      );
    });

    if (quitado) {
      filas.splice(
        Math.min(quitado.indice, filas.length),
        0,
        filaDeshacer as React.JSX.Element,
      );
    }

    contenido = (
      <>
        {cabecera("Tu pedido")}
        <IndicadorPasos paso={1} />
        <div className="cuerpo">
          {aviso}
          {filas}

          {bebidasSugeridas.length > 0 && (
            <div className="tira">
              <h4>
                <CupSoda size={18} aria-hidden="true" />
                {platos >= 2 ? "¿Bebida para compartir?" : "¿Algo de tomar?"}
              </h4>
              <div className="tiles">
                {bebidasSugeridas.map((bebida) => (
                  <MosaicoProducto
                    key={bebida.id}
                    producto={bebida}
                    esBebida
                    marca={unidadesDe(bebida.id) || undefined}
                    onElegir={onAgregarBebida}
                  />
                ))}
              </div>
            </div>
          )}

          {sugeridos.length > 0 && (
            <div className="tira gris">
              <h4>
                <Star size={18} aria-hidden="true" /> Los más pedidos
              </h4>
              <div className="tiles">
                {sugeridos.map((producto) => (
                  <MosaicoProducto
                    key={producto.id}
                    producto={producto}
                    esBebida={false}
                    onElegir={onElegirProducto}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pie col">
          <div className="tot">
            <span>
              Productos
              <small>
                {unidades} {unidades === 1 ? "unidad" : "unidades"}
              </small>
            </span>
            <span className="num">{pesos(subtotalProductos)}</span>
          </div>
          <button
            type="button"
            className="cta"
            onClick={() => {
              setQuitado(null);
              onCambiarPaso(2);
            }}
          >
            <span>Continuar</span>
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        </div>
      </>
    );
  } else {
    const costoDomicilio = !hayDireccion
      ? "Según tu zona"
      : esDomicilioFallback
        ? "Por confirmar"
        : pesos(valorDomicilio);

    contenido = (
      <>
        {cabecera("Entrega", true)}
        <IndicadorPasos paso={2} />
        <div className="cuerpo" ref={cuerpoRef}>
          {aviso}

          <div className="opc" role="group" aria-label="Tipo de entrega">
            <button
              type="button"
              aria-pressed={tipoEntrega === "domicilio"}
              onClick={() => cambiarTipoEntrega("domicilio")}
            >
              <Bike size={28} aria-hidden="true" />
              <span>Domicilio</span>
              <small className="num">{costoDomicilio}</small>
            </button>
            <button
              type="button"
              aria-pressed={tipoEntrega === "recoger"}
              onClick={() => cambiarTipoEntrega("recoger")}
            >
              <Store size={28} aria-hidden="true" />
              <span>Recoger</span>
              <small>Gratis</small>
            </button>
          </div>

          {usaRecordado && (
            <p className="pista bien recu">
              ✓ Usamos tus datos del último pedido.{" "}
              <button type="button" onClick={borrarDatosRecordados}>
                Borrar
              </button>
            </p>
          )}

          <div key={claveCampo("nombre")} className={claseCampo("nombre")}>
            <label htmlFor="nombre">Tu nombre</label>
            <div className="in">
              <User size={18} aria-hidden="true" />
              <input
                id="nombre"
                value={nombre}
                onChange={(event) => {
                  setNombre(event.target.value);
                  guardarCliente({ nombre: event.target.value });
                  quitarMarca("nombre");
                }}
                placeholder="Juan Pérez"
                autoComplete="name"
              />
            </div>
            <p className="err">Escribe tu nombre</p>
          </div>

          <div key={claveCampo("telefono")} className={claseCampo("telefono")}>
            <label htmlFor="telefono">Celular</label>
            <div className="in">
              <Smartphone size={18} aria-hidden="true" />
              <input
                id="telefono"
                value={telefono}
                onChange={(event) => {
                  setTelefono(event.target.value);
                  guardarCliente({ telefono: event.target.value });
                  quitarMarca("telefono");
                }}
                placeholder="300 123 4567"
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>
            <p className="err">Escribe tu celular (10 números)</p>
          </div>

          {tipoEntrega === "domicilio" ? (
            <>
              <div
                key={claveCampo("direccion")}
                className={claseCampo("direccion")}
              >
                <label htmlFor="direccion">Dirección</label>
                <div className="in">
                  <MapPin size={18} aria-hidden="true" />
                  <InputDireccionAutocomplete
                    id="direccion"
                    value={direccion}
                    onChangeDireccion={cambiarDireccion}
                    onSeleccionarDireccion={cambiarDireccion}
                    placeholder="Cra 36A # 105-58"
                  />
                </div>
                <p className="err">Escribe tu dirección</p>

                {hayDireccion &&
                  (esDomicilioFallback ? (
                    <p className="pista aviso-dom">
                      Domicilio estimado: {pesos(resultadoDomicilio.valor)} ·
                      sujeto a confirmación con la tienda
                    </p>
                  ) : (
                    <p className="pista bien">
                      ✓ Domicilio {pesos(valorDomicilio)} ·{" "}
                      {resultadoDomicilio.zona}
                    </p>
                  ))}
              </div>

              <div className="campo">
                <label htmlFor="indicacionesEntrega">
                  Indicaciones <i>(opcional)</i>
                </label>
                <div className="in">
                  <AlignLeft size={18} aria-hidden="true" />
                  <input
                    id="indicacionesEntrega"
                    value={indicacionesEntrega}
                    onChange={(event) => {
                      setIndicacionesEntrega(event.target.value);
                      guardarCliente({ indicaciones: event.target.value });
                    }}
                    placeholder="Casa blanca, segundo piso"
                  />
                </div>
              </div>
            </>
          ) : (
            negocio.direccion && (
              <p className="pista" style={{ marginTop: "12px" }}>
                Recoges en {negocio.direccion}.
              </p>
            )
          )}

          <div className="campo">
            <label htmlFor="comentarioPedido">
              Comentario del pedido <i>(opcional)</i>
            </label>
            <div className="in">
              <AlignLeft size={18} aria-hidden="true" />
              <input
                id="comentarioPedido"
                value={comentarioPedido}
                onChange={(event) => setComentarioPedido(event.target.value)}
                placeholder="Salsa aparte, sin cebolla"
              />
            </div>
          </div>

          <div className="campo">
            <span className="etq">¿Cómo pagas?</span>
            <div className="opc tres" role="group" aria-label="Forma de pago">
              <button
                type="button"
                aria-pressed={metodoPago === "efectivo"}
                onClick={() => cambiarMetodoPago("efectivo")}
              >
                <Banknote size={26} aria-hidden="true" />
                <span>Efectivo</span>
              </button>
              <button
                type="button"
                aria-pressed={metodoPago === "transferencia"}
                onClick={() => cambiarMetodoPago("transferencia")}
              >
                <Smartphone size={26} aria-hidden="true" />
                <span>Transferencia</span>
              </button>
              <button
                type="button"
                aria-pressed={metodoPago === "mixto"}
                onClick={() => cambiarMetodoPago("mixto")}
              >
                <span className="duo">
                  <Banknote size={22} aria-hidden="true" />
                  <Smartphone size={22} aria-hidden="true" />
                </span>
                <span>Mixto</span>
              </button>
            </div>
          </div>

          {metodoPago === "mixto" && (
            <div key={claveCampo("montos")} className={claseCampo("montos")}>
              <div className="montos">
                <div>
                  <label htmlFor="montoTransferencia">En transferencia</label>
                  <div className="in">
                    <Smartphone size={18} aria-hidden="true" />
                    <input
                      id="montoTransferencia"
                      value={montoTransferencia}
                      onChange={(event) => {
                        setMontoTransferencia(event.target.value);
                        quitarMarca("montos");
                      }}
                      placeholder="12000"
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="montoEfectivo">En efectivo</label>
                  <div className="in">
                    <Banknote size={18} aria-hidden="true" />
                    <input
                      id="montoEfectivo"
                      value={montoEfectivo}
                      onChange={(event) => {
                        setMontoEfectivo(event.target.value);
                        quitarMarca("montos");
                      }}
                      placeholder="8000"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
              <p className="err">Escribe cuánto pagas de cada forma</p>
            </div>
          )}

          <div className="cuenta num">
            <div>
              <span>Productos</span>
              <span>{pesos(subtotalProductos)}</span>
            </div>
            {tipoEntrega === "domicilio" && (
              <div>
                <span>Domicilio</span>
                <span>{costoDomicilio}</span>
              </div>
            )}
            <div className="t">
              <span>{esDomicilioFallback ? "Total estimado" : "Total"}</span>
              <span>{pesos(totalFinal)}</span>
            </div>
          </div>
        </div>

        <div className="pie col">
          <button type="button" className="cta wa" onClick={enviarPedido}>
            <MessageCircle size={22} aria-hidden="true" />
            <span>Enviar por WhatsApp</span>
            <span className="num fin">{pesos(totalFinal)}</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} etiqueta="Tu pedido">
      {contenido}
    </Hoja>
  );
}

function IndicadorPasos({ paso }: { paso: 1 | 2 }) {
  return (
    <div className="pasos">
      <span className={paso === 1 ? "act" : "hecho"}>
        {paso === 1 ? (
          <ShoppingBag size={16} aria-hidden="true" />
        ) : (
          <Check size={16} aria-hidden="true" />
        )}
        Pedido
      </span>
      <i />
      <span className={paso === 2 ? "act" : ""}>
        <Bike size={16} aria-hidden="true" /> Entrega
      </span>
    </div>
  );
}
