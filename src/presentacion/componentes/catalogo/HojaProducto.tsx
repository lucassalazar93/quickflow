"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { Check, CupSoda, Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { Producto } from "@/types/producto";
import type { ConfiguracionProducto } from "@/types/configuracion-producto";
import type { GrupoAdiciones } from "@/types/adicion";
import type { ItemCarrito } from "@/types/carrito";
import { GRUPOS_ADICIONES } from "@/config/adiciones";
import { crearIdItem } from "@/aplicacion/catalogo/crearIdItem";
import { Hoja } from "@/presentacion/componentes/comunes/Hoja";
import { Foto } from "@/presentacion/componentes/comunes/Foto";
import { MosaicoProducto } from "@/presentacion/componentes/catalogo/TarjetaProducto";
import { nombreVisible, pesos } from "@/presentacion/utilidades/formato";

// Extras visibles sin tocar "Ver más"
const EXTRAS_VISIBLES = 4;

type PropsContenido = {
  producto: Producto;
  configuracion: ConfiguracionProducto;
  total: number;
  itemIdEditar?: string | null;
  bebidas: Producto[];
  salsasRecordadas: boolean;
  onCerrar: () => void;
  onDisminuirCantidad: () => void;
  onAumentarCantidad: () => void;
  onSeleccionar: (grupoId: string, opcionId: string) => void;
  onCambiarCantidadOpcion: (
    grupoId: string,
    opcionId: string,
    delta: number,
  ) => void;
  onListo: (
    item: ItemCarrito,
    bebidasElegidas: Producto[],
    editado: boolean,
  ) => void;
};

type Props = Omit<PropsContenido, "producto" | "configuracion"> & {
  abierta: boolean;
  // Cambia en cada apertura para reiniciar el estado interno de la hoja
  apertura: number;
  producto: Producto | null;
  configuracion: ConfiguracionProducto | null;
};

export function HojaProducto({
  abierta,
  apertura,
  producto,
  configuracion,
  ...resto
}: Props) {
  return (
    <Hoja
      abierta={abierta}
      onCerrar={resto.onCerrar}
      etiqueta={producto ? nombreVisible(producto.nombre) : "Producto"}
    >
      {producto && configuracion && (
        <ContenidoProducto
          key={apertura}
          producto={producto}
          configuracion={configuracion}
          {...resto}
        />
      )}
    </Hoja>
  );
}

function ContenidoProducto({
  producto,
  configuracion,
  total,
  itemIdEditar,
  bebidas,
  salsasRecordadas,
  onCerrar,
  onDisminuirCantidad,
  onAumentarCantidad,
  onSeleccionar,
  onCambiarCantidadOpcion,
  onListo,
}: PropsContenido) {
  const [bebidasElegidas, setBebidasElegidas] = useState<string[]>([]);
  const [gruposExpandidos, setGruposExpandidos] = useState<string[]>([]);
  // Grupo obligatorio que faltó al intentar agregar; el contador reinicia la sacudida
  const [faltante, setFaltante] = useState({ grupoId: "", intento: 0 });
  const gruposRef = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    track("view_product", {
      producto_id: producto.id,
      producto: producto.nombre,
      precio: producto.precio,
      tiene_imagen: producto.imagen ? "si" : "no",
      origen: "modal_producto",
    });
  }, [producto]);

  const editando = Boolean(itemIdEditar);
  const grupos =
    producto.gruposAdicionesIds?.map((id) => GRUPOS_ADICIONES[id]) ?? [];
  const gruposObligatorios = grupos.filter((grupo) => grupo.obligatorio);
  const gruposOpcionales = grupos.filter((grupo) => !grupo.obligatorio);

  const seleccionadasEn = (grupoId: string) =>
    configuracion.selecciones.filter(
      (seleccion) => seleccion.grupoId === grupoId,
    );

  const estaPendiente = (grupo: GrupoAdiciones) =>
    grupo.obligatorio &&
    seleccionadasEn(grupo.id).length < (grupo.minSeleccion ?? 1);

  const totalBebidas = bebidas
    .filter((bebida) => bebidasElegidas.includes(bebida.id))
    .reduce((acc, bebida) => acc + bebida.precio, 0);

  const construirItemCarrito = (): ItemCarrito => {
    const gruposPorId = new Map(grupos.map((grupo) => [grupo.id, grupo]));

    const salsasSeleccionadas = seleccionadasEn("salsas").map(
      (seleccion) => seleccion.opcionId,
    );

    const adicionesSeleccionadas = seleccionadasEn("adiciones").map(
      (seleccion) => {
        const opcion = gruposPorId
          .get(seleccion.grupoId)
          ?.opciones.find((item) => item.id === seleccion.opcionId);

        return {
          id: seleccion.opcionId,
          nombre: opcion?.nombre ?? seleccion.opcionId,
          precio: opcion?.precio ?? 0,
          cantidad: seleccion.cantidad ?? 1,
        };
      },
    );

    const totalAdiciones = adicionesSeleccionadas.reduce(
      (acc, adicion) => acc + adicion.precio * adicion.cantidad,
      0,
    );

    return {
      id: itemIdEditar ?? crearIdItem(producto.id),
      productoId: producto.id,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precioBase: producto.precio,
      cantidad: configuracion.cantidad,
      salsas: salsasSeleccionadas,
      adiciones: adicionesSeleccionadas,
      total: (producto.precio + totalAdiciones) * configuracion.cantidad,
    };
  };

  const handleAgregar = () => {
    const pendiente = gruposObligatorios.find(estaPendiente);

    if (pendiente) {
      setFaltante((previo) => ({
        grupoId: pendiente.id,
        intento: previo.intento + 1,
      }));
      gruposRef.current
        .get(pendiente.id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const item = construirItemCarrito();

    track("add_to_cart", {
      producto_id: producto.id,
      producto: producto.nombre,
      cantidad: item.cantidad,
      precio_base: producto.precio,
      total_item: item.total,
      tiene_adiciones: item.adiciones.length > 0 ? "si" : "no",
      cantidad_adiciones: item.adiciones.length,
      cantidad_salsas: item.salsas.length,
      origen: editando ? "editar_producto" : "nuevo_producto",
    });

    onListo(
      item,
      bebidas.filter((bebida) => bebidasElegidas.includes(bebida.id)),
      editando,
    );
  };

  const alternarBebida = (bebida: Producto) =>
    setBebidasElegidas((previas) =>
      previas.includes(bebida.id)
        ? previas.filter((id) => id !== bebida.id)
        : [...previas, bebida.id],
    );

  const renderGrupo = (grupo: GrupoAdiciones) => {
    const elegidas = seleccionadasEn(grupo.id);
    const pendiente = estaPendiente(grupo);
    const falta = faltante.grupoId === grupo.id && pendiente;
    const conCantidad = grupo.opciones.some((opcion) => opcion.permiteCantidad);

    let estado = "";

    if (grupo.obligatorio) {
      if (falta) {
        estado = "Toca una opción";
      } else if (pendiente) {
        estado = `Elige al menos ${grupo.minSeleccion ?? 1}`;
      } else {
        estado =
          salsasRecordadas && !editando ? "✓ Como la última vez" : "✓ Listo";
      }
    }

    const expandido =
      gruposExpandidos.includes(grupo.id) ||
      grupo.opciones
        .slice(EXTRAS_VISIBLES)
        .some((opcion) => elegidas.some((s) => s.opcionId === opcion.id));

    const opcionesVisibles =
      conCantidad && !expandido
        ? grupo.opciones.slice(0, EXTRAS_VISIBLES)
        : grupo.opciones;

    return (
      <div
        key={falta ? `${grupo.id}-${faltante.intento}` : grupo.id}
        className={`grupo${falta ? " falta" : ""}`}
        ref={(nodo) => {
          if (nodo) {
            gruposRef.current.set(grupo.id, nodo);
          }
        }}
      >
        <div className="g-top">
          <h3>
            {conCantidad && <Plus size={18} aria-hidden="true" />}
            {grupo.obligatorio ? `Elige: ${grupo.nombre}` : grupo.nombre}
          </h3>
          {estado && (
            <span className={`req${!pendiente ? " ok" : ""}`}>{estado}</span>
          )}
        </div>

        {conCantidad ? (
          <>
            <div className="filas">
              {opcionesVisibles.map((opcion) => {
                const cantidad =
                  elegidas.find((s) => s.opcionId === opcion.id)?.cantidad ?? 0;

                return (
                  <div key={opcion.id} className="fila">
                    <div className="n">
                      {opcion.nombre}
                      {opcion.precio > 0 && (
                        <small className="num">+ {pesos(opcion.precio)}</small>
                      )}
                    </div>

                    <div className="step">
                      {cantidad > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onCambiarCantidadOpcion(grupo.id, opcion.id, -1)
                            }
                            aria-label={`Quitar ${opcion.nombre}`}
                          >
                            <Minus size={18} aria-hidden="true" />
                          </button>
                          <output className="num">{cantidad}</output>
                        </>
                      )}
                      <button
                        type="button"
                        className="add"
                        onClick={() =>
                          onCambiarCantidadOpcion(grupo.id, opcion.id, 1)
                        }
                        aria-label={`Agregar ${opcion.nombre}`}
                      >
                        <Plus size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {!expandido && grupo.opciones.length > EXTRAS_VISIBLES && (
              <button
                type="button"
                className="vermas"
                onClick={() =>
                  setGruposExpandidos((previos) => [...previos, grupo.id])
                }
              >
                <Plus size={16} aria-hidden="true" /> Ver más
              </button>
            )}
          </>
        ) : (
          <div className="chips">
            {grupo.opciones.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className="chip"
                aria-pressed={elegidas.some((s) => s.opcionId === opcion.id)}
                onClick={() => onSeleccionar(grupo.id, opcion.id)}
              >
                {opcion.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        className="rnd flot"
        onClick={onCerrar}
        aria-label="Cerrar"
      >
        <X size={20} aria-hidden="true" />
      </button>

      <div className="cuerpo" style={{ padding: 0 }}>
        <Foto src={producto.imagen} className="hero" prioritaria />

        <div style={{ padding: "0 16px 16px" }}>
          <div className="p-head">
            <h2>{nombreVisible(producto.nombre)}</h2>
            <p>{producto.descripcion}</p>
            <div className="pr num">{pesos(producto.precio)}</div>
          </div>

          {gruposObligatorios.map(renderGrupo)}

          {!editando && bebidas.length > 0 && (
            <div className="grupo">
              <div className="g-top">
                <h3>
                  <CupSoda size={18} aria-hidden="true" /> ¿Algo de tomar?
                </h3>
              </div>
              <div className="tiles lib">
                {bebidas.map((bebida) => (
                  <MosaicoProducto
                    key={bebida.id}
                    producto={bebida}
                    esBebida
                    marca={
                      bebidasElegidas.includes(bebida.id) ? (
                        <Check size={18} />
                      ) : undefined
                    }
                    onElegir={alternarBebida}
                  />
                ))}
              </div>
            </div>
          )}

          {gruposOpcionales.map(renderGrupo)}
        </div>
      </div>

      <div className="pie">
        <div className="step">
          <button
            type="button"
            onClick={onDisminuirCantidad}
            disabled={configuracion.cantidad <= 1}
            aria-label="Una unidad menos"
          >
            <Minus size={18} aria-hidden="true" />
          </button>
          <output className="num">{configuracion.cantidad}</output>
          <button
            type="button"
            onClick={onAumentarCantidad}
            aria-label="Una unidad más"
          >
            <Plus size={18} aria-hidden="true" />
          </button>
        </div>

        <button type="button" className="cta" onClick={handleAgregar}>
          {editando ? (
            <Check size={22} aria-hidden="true" />
          ) : (
            <ShoppingBag size={22} aria-hidden="true" />
          )}
          <span>{editando ? "Guardar" : "Agregar"}</span>
          <span className="num fin">{pesos(total + totalBebidas)}</span>
        </button>
      </div>
    </>
  );
}
