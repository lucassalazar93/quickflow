"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { track } from "@vercel/analytics";
import { ArrowRight, Bike, Clock3 } from "lucide-react";
import { actualizarCantidadProducto } from "@/aplicacion/catalogo/actualizarCantidadProducto";
import { actualizarSeleccionGrupo } from "@/aplicacion/catalogo/actualizarSeleccionGrupo";
import { calcularTotalProducto } from "@/aplicacion/catalogo/calcularTotalProducto";
import { crearIdItem } from "@/aplicacion/catalogo/crearIdItem";
import { inicializarConfiguracionProducto } from "@/aplicacion/catalogo/inicializarConfiguracionProducto";
import {
  guardarCliente,
  leerCliente,
} from "@/aplicacion/cliente/clienteRecordado";
import { GRUPOS_ADICIONES } from "@/config/adiciones";
import type { Producto } from "@/types/producto";
import type { ConfiguracionProducto } from "@/types/configuracion-producto";
import type { ItemCarrito } from "@/types/carrito";
import type { Negocio } from "@/types/negocio";
import type { Categoria } from "@/types/categoria";
import {
  obtenerEstadoNegocio,
  obtenerResumenHorariosVisible,
} from "@/dominio/horarios/obtenerEstadoNegocio";
import { useCarritoStore } from "@/store/carrito.store";
import { Foto } from "@/presentacion/componentes/comunes/Foto";
import { PieQuickFlow } from "@/presentacion/componentes/comunes/FirmaQuickFlow";
import { TarjetaProducto } from "@/presentacion/componentes/catalogo/TarjetaProducto";
import { HojaProducto } from "@/presentacion/componentes/catalogo/HojaProducto";
import { BarraPedido } from "@/presentacion/componentes/carrito/BarraPedido";
import {
  BandejaAgregado,
  type AvisoAgregado,
} from "@/presentacion/componentes/carrito/BandejaAgregado";
import {
  HojaPedido,
  type PasoPedido,
} from "@/presentacion/componentes/carrito/HojaPedido";
import { HojaHorarios } from "@/presentacion/componentes/negocio/HojaHorarios";
import {
  PantallaInicio,
  PortadaInicio,
} from "@/presentacion/componentes/negocio/PantallaInicio";
import { nombreVisible, pesos } from "@/presentacion/utilidades/formato";
import "@/presentacion/estilos/catalogo.css";

interface PaginaNegocioClientProps {
  negocio: Negocio;
  categorias: Categoria[];
  productos: Producto[];
  // Ids de los productos más vendidos, en orden
  masPedidos: string[];
  // Categoría que se ofrece como venta cruzada (bebidas)
  categoriaBebidasId?: string;
}

// Ocupa la línea mientras llega el estado real, para que nada salte
const ESPACIO_FIJO = String.fromCharCode(160);

const sinSuscripcion = () => () => {};

export function PaginaNegocioClient({
  negocio,
  categorias,
  productos,
  masPedidos,
  categoriaBebidasId,
}: PaginaNegocioClientProps) {
  // Falso en el servidor y durante la hidratación; verdadero ya en el navegador
  const montado = useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );

  const items = useCarritoStore((s) => s.items);
  const agregarItem = useCarritoStore((s) => s.agregarItem);
  const actualizarItem = useCarritoStore((s) => s.actualizarItem);

  const [categoriaActiva, setCategoriaActiva] = useState(
    categorias[0]?.id ?? "",
  );

  const [productoActivo, setProductoActivo] = useState<Producto | null>(null);
  const [configuracionActiva, setConfiguracionActiva] =
    useState<ConfiguracionProducto | null>(null);
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);
  const [hojaProductoAbierta, setHojaProductoAbierta] = useState(false);
  const [aperturaProducto, setAperturaProducto] = useState(0);
  const [salsasRecordadas, setSalsasRecordadas] = useState(false);

  const [pedidoAbierto, setPedidoAbierto] = useState(false);
  const [pasoPedido, setPasoPedido] = useState<PasoPedido>(1);
  const [horariosAbiertos, setHorariosAbiertos] = useState(false);
  const [introActiva, setIntroActiva] = useState(true);
  const [aviso, setAviso] = useState<AvisoAgregado | null>(null);
  const [bandejaVisible, setBandejaVisible] = useState(false);

  const [marcaTiempo, setMarcaTiempo] = useState(() => Date.now());
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const espiaEnPausaRef = useRef(false);
  const temporizadorEspiaRef = useRef<number | undefined>(undefined);
  const temporizadorBandejaRef = useRef<number | undefined>(undefined);

  const estadoNegocio = useMemo(
    () => obtenerEstadoNegocio(negocio, new Date(marcaTiempo)),
    [negocio, marcaTiempo],
  );
  const resumenHorarios = useMemo(
    () => obtenerResumenHorariosVisible(negocio),
    [negocio],
  );
  // Las páginas se generan al compilar: el estado según la hora solo se pinta
  // en el navegador, para que el HTML inicial sea el mismo a cualquier hora
  const tiendaCerrada = montado && estadoNegocio.estado === "cerrado";

  // Si la tienda cierra con la página abierta, vuelve la pantalla de inicio
  if (tiendaCerrada && !introActiva) {
    setIntroActiva(true);
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMarcaTiempo(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const categoriasOrdenadas = useMemo(
    () => [...categorias].sort((a, b) => a.orden - b.orden),
    [categorias],
  );

  const esBebida = useCallback(
    (producto: Producto) => producto.categoriaId === categoriaBebidasId,
    [categoriaBebidasId],
  );

  const bebidas = useMemo(
    () => productos.filter(esBebida),
    [productos, esBebida],
  );

  const destacados = useMemo(
    () =>
      masPedidos
        .map((id) => productos.find((producto) => producto.id === id))
        .filter((producto): producto is Producto => Boolean(producto)),
    [masPedidos, productos],
  );

  const unidadesPorProducto = useMemo(() => {
    const unidades = new Map<string, number>();

    items.forEach((item) => {
      unidades.set(
        item.productoId,
        (unidades.get(item.productoId) ?? 0) + item.cantidad,
      );
    });

    return unidades;
  }, [items]);

  const sugeridos = destacados
    .filter((producto) => !unidadesPorProducto.has(producto.id))
    .slice(0, 5);

  const nombreCliente = useMemo(
    () => (montado ? (leerCliente().nombre.trim().split(/\s+/)[0] ?? "") : ""),
    [montado],
  );

  // La categoría activa sigue al scroll, sin mover la página
  useEffect(() => {
    if (tiendaCerrada) {
      return;
    }

    const secciones = document.querySelectorAll<HTMLElement>(".qf [data-sec]");

    const espia = new IntersectionObserver(
      (entradas) => {
        if (espiaEnPausaRef.current) {
          return;
        }

        entradas.forEach((entrada) => {
          const categoria = (entrada.target as HTMLElement).dataset.tab;

          if (entrada.isIntersecting && categoria) {
            setCategoriaActiva(categoria);
          }
        });
      },
      { rootMargin: "-72px 0px -62% 0px" },
    );

    secciones.forEach((seccion) => espia.observe(seccion));

    return () => {
      espia.disconnect();
    };
  }, [tiendaCerrada, categoriasOrdenadas]);

  // En pantallas angostas la pestaña activa se centra dentro de su barra
  useEffect(() => {
    const barra = tabsRef.current;
    const activa = barra?.querySelector<HTMLElement>('[aria-current="true"]');

    if (!barra || !activa || barra.scrollWidth <= barra.clientWidth) {
      return;
    }

    barra.scrollTo({
      left: activa.offsetLeft - (barra.clientWidth - activa.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [categoriaActiva]);

  const algunaHojaAbierta =
    hojaProductoAbierta || pedidoAbierto || horariosAbiertos;
  const pantallaInicioVisible = introActiva || tiendaCerrada;

  useEffect(() => {
    document.documentElement.classList.toggle(
      "qf-bloq",
      algunaHojaAbierta || pantallaInicioVisible,
    );

    return () => {
      document.documentElement.classList.remove("qf-bloq");
    };
  }, [algunaHojaAbierta, pantallaInicioVisible]);

  useEffect(() => {
    if (!algunaHojaAbierta) {
      return;
    }

    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") {
        return;
      }

      if (hojaProductoAbierta) {
        setHojaProductoAbierta(false);
      } else if (horariosAbiertos) {
        setHorariosAbiertos(false);
      } else {
        setPedidoAbierto(false);
      }
    };

    window.addEventListener("keydown", alPresionar);

    return () => {
      window.removeEventListener("keydown", alPresionar);
    };
  }, [algunaHojaAbierta, hojaProductoAbierta, horariosAbiertos]);

  useEffect(() => {
    return () => {
      window.clearTimeout(temporizadorBandejaRef.current);
      window.clearTimeout(temporizadorEspiaRef.current);
    };
  }, []);

  const terminarIntro = useCallback(() => {
    setIntroActiva(false);
  }, []);

  const irACategoria = (categoriaId: string) => {
    const seccion = document.querySelector<HTMLElement>(
      `.qf section[data-tab="${categoriaId}"][data-categoria]`,
    );
    const barra = tabsRef.current?.parentElement;

    if (!seccion) {
      return;
    }

    // Mientras dura el salto, el espía no cambia la pestaña
    espiaEnPausaRef.current = true;
    window.clearTimeout(temporizadorEspiaRef.current);
    temporizadorEspiaRef.current = window.setTimeout(() => {
      espiaEnPausaRef.current = false;
    }, 900);
    setCategoriaActiva(categoriaId);

    window.scrollTo({
      top:
        seccion.getBoundingClientRect().top +
        window.scrollY -
        (barra?.offsetHeight ?? 0) -
        4,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const mostrarBandeja = (nuevoAviso: AvisoAgregado) => {
    setAviso(nuevoAviso);
    setBandejaVisible(true);

    window.clearTimeout(temporizadorBandejaRef.current);
    temporizadorBandejaRef.current = window.setTimeout(
      () => setBandejaVisible(false),
      nuevoAviso.sugerirBebidas ? 9000 : 2200,
    );
  };

  const ocultarBandeja = () => {
    window.clearTimeout(temporizadorBandejaRef.current);
    setBandejaVisible(false);
  };

  // Productos sin opciones (bebidas): un toque los suma, sin abrir la hoja
  const sumarProductoSimple = (producto: Producto) => {
    const existente = useCarritoStore
      .getState()
      .items.find(
        (item) =>
          item.productoId === producto.id &&
          item.salsas.length === 0 &&
          item.adiciones.length === 0,
      );

    if (existente) {
      actualizarItem(existente.id, {
        ...existente,
        cantidad: existente.cantidad + 1,
        total: existente.total + producto.precio,
      });
    } else {
      agregarItem({
        id: crearIdItem(producto.id),
        productoId: producto.id,
        nombre: producto.nombre,
        imagen: producto.imagen,
        precioBase: producto.precio,
        cantidad: 1,
        salsas: [],
        adiciones: [],
        total: producto.precio,
      });
    }

    track("add_to_cart", {
      producto_id: producto.id,
      producto: producto.nombre,
      cantidad: 1,
      precio_base: producto.precio,
      total_item: producto.precio,
      tiene_adiciones: "no",
      cantidad_adiciones: 0,
      cantidad_salsas: 0,
      origen: "agregado_directo",
    });
  };

  const sumarDesdeBandeja = (producto: Producto) => {
    sumarProductoSimple(producto);
    mostrarBandeja({
      nombre: producto.nombre,
      imagen: producto.imagen,
      esBebida: esBebida(producto),
      sugerirBebidas: false,
    });
  };

  const abrirHojaProducto = (
    producto: Producto,
    configuracion: ConfiguracionProducto,
    itemId: string | null,
  ) => {
    setProductoActivo(producto);
    setConfiguracionActiva(configuracion);
    setItemEditandoId(itemId);
    setAperturaProducto((apertura) => apertura + 1);
    setHojaProductoAbierta(true);
    ocultarBandeja();
  };

  const abrirConfiguracionProducto = (producto: Producto) => {
    const configuracionInicial = inicializarConfiguracionProducto(producto);

    // Las salsas del último pedido llegan marcadas; el cliente puede cambiarlas
    const opcionesSalsas = producto.gruposAdicionesIds?.includes("salsas")
      ? GRUPOS_ADICIONES.salsas.opciones
      : [];
    const salsasGuardadas = leerCliente().salsas.filter((id) =>
      opcionesSalsas.some((opcion) => opcion.id === id),
    );
    const yaTraeSalsas = configuracionInicial.selecciones.some(
      (seleccion) => seleccion.grupoId === "salsas",
    );
    const usarGuardadas = salsasGuardadas.length > 0 && !yaTraeSalsas;

    setSalsasRecordadas(usarGuardadas);
    abrirHojaProducto(
      producto,
      usarGuardadas
        ? {
            ...configuracionInicial,
            selecciones: [
              ...configuracionInicial.selecciones,
              ...salsasGuardadas.map((id) => ({
                grupoId: "salsas",
                opcionId: id,
                cantidad: 1,
              })),
            ],
          }
        : configuracionInicial,
      null,
    );
  };

  const elegirProducto = (producto: Producto) => {
    if (!producto.gruposAdicionesIds?.length) {
      sumarDesdeBandeja(producto);
      return;
    }

    abrirConfiguracionProducto(producto);
  };

  const cerrarConfiguracionProducto = () => {
    setHojaProductoAbierta(false);
  };

  const aumentarCantidad = () => {
    if (!configuracionActiva) return;

    const nueva = actualizarCantidadProducto({
      configuracion: configuracionActiva,
      cantidad: configuracionActiva.cantidad + 1,
    });

    setConfiguracionActiva(nueva);
  };

  const disminuirCantidad = () => {
    if (!configuracionActiva) return;

    const nueva = actualizarCantidadProducto({
      configuracion: configuracionActiva,
      cantidad: configuracionActiva.cantidad - 1,
    });

    setConfiguracionActiva(nueva);
  };

  const seleccionarOpcion = (grupoId: string, opcionId: string) => {
    if (!configuracionActiva) return;

    const nueva = actualizarSeleccionGrupo({
      configuracion: configuracionActiva,
      grupoId,
      opcionId,
    });

    let nuevasSelecciones = nueva.selecciones;

    if (grupoId === "salsas") {
      const tieneSinSalsa = nuevasSelecciones.some(
        (seleccion) =>
          seleccion.grupoId === "salsas" && seleccion.opcionId === "sin-salsa",
      );

      if (opcionId === "sin-salsa" && tieneSinSalsa) {
        nuevasSelecciones = nuevasSelecciones.filter(
          (seleccion) =>
            seleccion.grupoId !== "salsas" || seleccion.opcionId === "sin-salsa",
        );
      }

      if (opcionId !== "sin-salsa") {
        nuevasSelecciones = nuevasSelecciones.filter(
          (seleccion) =>
            !(seleccion.grupoId === "salsas" && seleccion.opcionId === "sin-salsa"),
        );
      }
    }

    setSalsasRecordadas(false);
    setConfiguracionActiva({
      ...nueva,
      selecciones: nuevasSelecciones,
    });
  };

  const cambiarCantidadOpcion = (
    grupoId: string,
    opcionId: string,
    delta: number,
  ) => {
    if (!configuracionActiva) return;

    const seleccionActual = configuracionActiva.selecciones.find(
      (seleccion) =>
        seleccion.grupoId === grupoId && seleccion.opcionId === opcionId,
    );

    const cantidadActual = seleccionActual?.cantidad ?? 0;
    const nuevaCantidad = cantidadActual + delta;

    let nuevasSelecciones = configuracionActiva.selecciones;

    if (nuevaCantidad <= 0) {
      nuevasSelecciones = configuracionActiva.selecciones.filter(
        (seleccion) =>
          !(seleccion.grupoId === grupoId && seleccion.opcionId === opcionId),
      );
    } else if (seleccionActual) {
      nuevasSelecciones = configuracionActiva.selecciones.map((seleccion) =>
        seleccion.grupoId === grupoId && seleccion.opcionId === opcionId
          ? { ...seleccion, cantidad: nuevaCantidad }
          : seleccion,
      );
    } else {
      nuevasSelecciones = [
        ...configuracionActiva.selecciones,
        { grupoId, opcionId, cantidad: nuevaCantidad },
      ];
    }

    setConfiguracionActiva({
      ...configuracionActiva,
      selecciones: nuevasSelecciones,
    });
  };

  const totalProducto =
    productoActivo && configuracionActiva
      ? calcularTotalProducto(productoActivo, configuracionActiva)
      : 0;

  const editarItemCarrito = (item: ItemCarrito) => {
    const producto = productos.find((p) => p.id === item.productoId);

    if (!producto) {
      return;
    }

    const selecciones = [
      ...item.salsas.map((id) => ({
        grupoId: "salsas",
        opcionId: id,
        cantidad: 1,
      })),
      ...item.adiciones.map((adicion) => ({
        grupoId: "adiciones",
        opcionId: adicion.id,
        cantidad: adicion.cantidad,
      })),
    ];

    setSalsasRecordadas(false);
    setPedidoAbierto(false);
    abrirHojaProducto(
      producto,
      {
        productoId: item.productoId,
        cantidad: item.cantidad,
        selecciones,
      },
      item.id,
    );
  };

  const terminarProducto = (
    item: ItemCarrito,
    bebidasElegidas: Producto[],
    editado: boolean,
  ) => {
    const yaHabiaBebida = useCarritoStore
      .getState()
      .items.some((enPedido) =>
        bebidas.some((bebida) => bebida.id === enPedido.productoId),
      );

    if (editado) {
      actualizarItem(item.id, item);
    } else {
      agregarItem(item);
    }

    bebidasElegidas.forEach(sumarProductoSimple);
    guardarCliente({ salsas: item.salsas });
    setHojaProductoAbierta(false);

    if (editado) {
      // Venía de corregir el pedido: vuelve a verlo
      setPasoPedido(1);
      setPedidoAbierto(true);
      return;
    }

    mostrarBandeja({
      nombre: item.nombre,
      imagen: item.imagen,
      esBebida: false,
      sugerirBebidas: !yaHabiaBebida && bebidasElegidas.length === 0,
    });
  };

  const abrirPedido = () => {
    ocultarBandeja();
    setPasoPedido(1);
    setPedidoAbierto(true);
  };

  const elegirDesdePedido = (producto: Producto) => {
    setPedidoAbierto(false);
    elegirProducto(producto);
  };

  const sinDomicilios =
    montado && !tiendaCerrada && estadoNegocio.estado !== "abierto";
  const caraAnfitriona = negocio.anfitriona?.cara;

  return (
    <div className={`qf${sinDomicilios ? " con-cartel" : ""}`}>
      {!tiendaCerrada && (
        <div inert={introActiva}>
          <div className="wrap">
            <header className="top">
              <img
                className="logo"
                src={negocio.logo}
                alt=""
                width={48}
                height={48}
              />
              <div>
                <h1>{negocio.nombre}</h1>
                <p className="estado">
                  {montado ? (
                    <>
                      <b>Abierto</b>
                      {estadoNegocio.cierre
                        ? ` hasta las ${estadoNegocio.cierre}`
                        : ""}
                    </>
                  ) : (
                    ESPACIO_FIJO
                  )}
                </p>
              </div>
            </header>

            <button
              type="button"
              className="horario"
              onClick={() => {
                ocultarBandeja();
                setHorariosAbiertos(true);
              }}
              aria-label="Ver horarios"
            >
              {sinDomicilios ? (
                <Clock3 size={18} aria-hidden="true" />
              ) : (
                <Bike size={18} aria-hidden="true" />
              )}
              <span>{montado ? estadoNegocio.lineaCorta : ESPACIO_FIJO}</span>
              <span className="ver">
                Horarios <ArrowRight size={16} aria-hidden="true" />
              </span>
            </button>

            {sinDomicilios && (
              <div className="cartel" role="status">
                {caraAnfitriona && (
                  <img
                    className="av"
                    src={caraAnfitriona}
                    alt=""
                    width={192}
                    height={192}
                  />
                )}
                <span>
                  <b>{estadoNegocio.lineaCorta}</b>
                  {estadoNegocio.estado === "domicilios_no_disponibles"
                    ? "Por ahora puedes pedir para recoger en tienda."
                    : `Aún puedes pedir para recoger${estadoNegocio.cierre ? ` hasta las ${estadoNegocio.cierre}` : ""}.`}
                </span>
              </div>
            )}
          </div>

          <nav className="tabs" aria-label="Categorías">
            <div className="wrap" ref={tabsRef}>
              {categoriasOrdenadas.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  className="tab"
                  aria-current={categoria.id === categoriaActiva}
                  onClick={() => irACategoria(categoria.id)}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </nav>

          <main className="wrap">
            {destacados.length > 0 && (
              <section data-sec data-tab={categoriasOrdenadas[0]?.id}>
                <div className="anf">
                  {caraAnfitriona && (
                    <img
                      className="av c44"
                      src={caraAnfitriona}
                      alt=""
                      width={192}
                      height={192}
                    />
                  )}
                  <div>
                    <h2 className="sec">Los más pedidos</h2>
                    <p className="sec-sub">
                      {nombreCliente
                        ? `Hola, ${nombreCliente}. Esto es lo que más piden.`
                        : "Lo que más piden nuestros clientes."}
                    </p>
                  </div>
                </div>

                <div className="dest">
                  {destacados.map((producto, indice) => (
                    <button
                      key={producto.id}
                      type="button"
                      className="dcard"
                      onClick={() => elegirProducto(producto)}
                      aria-label={`Número ${indice + 1}: ${nombreVisible(producto.nombre)}, ${pesos(producto.precio)}`}
                    >
                      <Foto src={producto.imagen} prioritaria={indice < 3} />
                      <span className="rank num" aria-hidden="true">
                        {indice + 1}
                      </span>
                      <span className="tx">
                        <strong>{nombreVisible(producto.nombre)}</strong>
                        <span className="num">{pesos(producto.precio)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {categoriasOrdenadas.map((categoria) => (
              <section
                key={categoria.id}
                data-sec
                data-categoria
                data-tab={categoria.id}
              >
                <h2 className="sec">{categoria.nombre}</h2>
                <div className="grid">
                  {productos
                    .filter(
                      (producto) => producto.categoriaId === categoria.id,
                    )
                    .sort((a, b) => {
                      if (a.precio !== b.precio) {
                        return a.precio - b.precio;
                      }

                      return a.nombre.localeCompare(b.nombre, "es");
                    })
                    .map((producto) => (
                      <TarjetaProducto
                        key={producto.id}
                        producto={producto}
                        enPedido={unidadesPorProducto.get(producto.id) ?? 0}
                        esBebida={esBebida(producto)}
                        onElegir={elegirProducto}
                      />
                    ))}
                </div>
              </section>
            ))}

            <PieQuickFlow />
          </main>

          <BandejaAgregado
            aviso={aviso}
            visible={bandejaVisible}
            bebidas={bebidas}
            caraAnfitriona={caraAnfitriona}
            onAgregarBebida={sumarDesdeBandeja}
            onCerrar={ocultarBandeja}
          />

          <BarraPedido onClick={abrirPedido} />

          {montado && (
            <>
              <HojaProducto
                abierta={hojaProductoAbierta}
                apertura={aperturaProducto}
                producto={productoActivo}
                configuracion={configuracionActiva}
                total={totalProducto}
                itemIdEditar={itemEditandoId}
                bebidas={bebidas}
                salsasRecordadas={salsasRecordadas}
                onCerrar={cerrarConfiguracionProducto}
                onDisminuirCantidad={disminuirCantidad}
                onAumentarCantidad={aumentarCantidad}
                onSeleccionar={seleccionarOpcion}
                onCambiarCantidadOpcion={cambiarCantidadOpcion}
                onListo={terminarProducto}
              />

              <HojaPedido
                abierta={pedidoAbierto}
                paso={pasoPedido}
                onCambiarPaso={setPasoPedido}
                onCerrar={() => setPedidoAbierto(false)}
                onEditarItem={editarItemCarrito}
                onAgregarBebida={sumarProductoSimple}
                onElegirProducto={elegirDesdePedido}
                negocio={negocio}
                estadoNegocio={estadoNegocio}
                bebidas={bebidas}
                sugeridos={sugeridos}
              />

              <HojaHorarios
                abierta={horariosAbiertos}
                onCerrar={() => setHorariosAbiertos(false)}
                estadoNegocio={estadoNegocio}
                resumenHorarios={resumenHorarios}
              />
            </>
          )}
        </div>
      )}

      {!montado && <PortadaInicio negocio={negocio} />}

      {montado && pantallaInicioVisible && (
        <PantallaInicio
          negocio={negocio}
          estadoNegocio={estadoNegocio}
          resumenHorarios={resumenHorarios}
          onSalir={terminarIntro}
        />
      )}
    </div>
  );
}
