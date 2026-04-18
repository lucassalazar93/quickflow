"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { actualizarCantidadProducto } from "@/aplicacion/catalogo/actualizarCantidadProducto";
import { actualizarSeleccionGrupo } from "@/aplicacion/catalogo/actualizarSeleccionGrupo";
import { calcularTotalProducto } from "@/aplicacion/catalogo/calcularTotalProducto";
import { inicializarConfiguracionProducto } from "@/aplicacion/catalogo/inicializarConfiguracionProducto";
import type { Producto } from "@/types/producto";
import type { ConfiguracionProducto } from "@/types/configuracion-producto";
import type { ItemCarrito } from "@/types/carrito";
import type { Negocio } from "@/types/negocio";
import type { Categoria } from "@/types/categoria";
import {
  obtenerEstadoNegocio,
  obtenerResumenHorariosVisible,
} from "@/dominio/horarios/obtenerEstadoNegocio";
import { EncabezadoNegocio } from "@/presentacion/componentes/negocio/EncabezadoNegocio";
import { BotonAnimado } from "@/presentacion/componentes/comunes/BotonAnimado";
import { TarjetaProducto } from "@/presentacion/componentes/catalogo/TarjetaProducto";
import { ModalProducto } from "@/presentacion/componentes/catalogo/ModalProducto";
import { CarritoFlotante } from "@/presentacion/componentes/carrito/CarritoFlotante";
import { ModalCarrito } from "@/presentacion/componentes/carrito/ModalCarrito";

interface PaginaNegocioClientProps {
  negocio: Negocio;
  categorias: Categoria[];
  productos: Producto[];
}

export function PaginaNegocioClient({
  negocio,
  categorias,
  productos,
}: PaginaNegocioClientProps) {
  const [categoriaActiva, setCategoriaActiva] = useState(
    categorias[0]?.id ?? "",
  );

  const [productoActivo, setProductoActivo] = useState<Producto | null>(null);
  const [configuracionActiva, setConfiguracionActiva] =
    useState<ConfiguracionProducto | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);
  const [categoriasAnimadas, setCategoriasAnimadas] = useState(true);
  const [marcaTiempo, setMarcaTiempo] = useState(() => Date.now());
  const carruselRef = useRef<HTMLDivElement | null>(null);
  const arrastreRef = useRef({
    activo: false,
    inicioX: 0,
    scrollInicial: 0,
  });

  const categoriasLoop = [...categorias, ...categorias, ...categorias];
  const estadoNegocio = useMemo(
    () => obtenerEstadoNegocio(negocio, new Date(marcaTiempo)),
    [negocio, marcaTiempo],
  );
  const resumenHorarios = useMemo(
    () => obtenerResumenHorariosVisible(negocio),
    [negocio],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMarcaTiempo(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const normalizarScrollCarrusel = () => {
    const carrusel = carruselRef.current;

    if (!carrusel) {
      return;
    }

    const anchoSegmento = carrusel.scrollWidth / 3;

    if (anchoSegmento <= 0) {
      return;
    }

    while (carrusel.scrollLeft < anchoSegmento * 0.5) {
      carrusel.scrollLeft += anchoSegmento;
    }

    while (carrusel.scrollLeft > anchoSegmento * 1.5) {
      carrusel.scrollLeft -= anchoSegmento;
    }
  };

  useEffect(() => {
    const carrusel = carruselRef.current;

    if (!carrusel) {
      return;
    }

    carrusel.scrollLeft = carrusel.scrollWidth / 3;
  }, [categorias.length]);

  useEffect(() => {
    if (!categoriasAnimadas) {
      return;
    }

    const carrusel = carruselRef.current;

    if (!carrusel) {
      return;
    }

    let frameId = 0;

    const animar = () => {
      const anchoSegmento = carrusel.scrollWidth / 3;

      if (anchoSegmento > 0) {
        carrusel.scrollLeft += 0.28;

        if (carrusel.scrollLeft >= anchoSegmento * 1.5) {
          carrusel.scrollLeft -= anchoSegmento;
        }
      }

      frameId = window.requestAnimationFrame(animar);
    };

    frameId = window.requestAnimationFrame(animar);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [categoriasAnimadas, categorias.length]);

  const iniciarArrastreMouse = (event: React.MouseEvent<HTMLDivElement>) => {
    const carrusel = carruselRef.current;

    if (!carrusel) {
      return;
    }

    arrastreRef.current = {
      activo: true,
      inicioX: event.clientX,
      scrollInicial: carrusel.scrollLeft,
    };

    setCategoriasAnimadas(false);
  };

  const moverArrastreMouse = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!arrastreRef.current.activo) {
      return;
    }

    const carrusel = carruselRef.current;

    if (!carrusel) {
      return;
    }

    event.preventDefault();
    const delta = event.clientX - arrastreRef.current.inicioX;
    carrusel.scrollLeft = arrastreRef.current.scrollInicial - delta;
    normalizarScrollCarrusel();
  };

  const terminarArrastreMouse = () => {
    if (!arrastreRef.current.activo) {
      return;
    }

    arrastreRef.current.activo = false;
    setCategoriasAnimadas(true);
  };

  const manejarSalidaMouseCarrusel = () => {
    terminarArrastreMouse();
    setCategoriasAnimadas(true);
  };

  const productosFiltrados = productos
    .filter((producto) => producto.categoriaId === categoriaActiva)
    .sort((a, b) => {
      if (a.precio !== b.precio) {
        return a.precio - b.precio;
      }

      return a.nombre.localeCompare(b.nombre, "es");
    });

  const abrirConfiguracionProducto = (producto: Producto) => {
    const configuracionInicial = inicializarConfiguracionProducto(producto);

    setProductoActivo(producto);
    setConfiguracionActiva(configuracionInicial);
  };

  const cerrarConfiguracionProducto = () => {
    setProductoActivo(null);
    setConfiguracionActiva(null);
    setItemEditandoId(null);
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

    setProductoActivo(producto);
    setConfiguracionActiva({
      productoId: item.productoId,
      cantidad: item.cantidad,
      selecciones,
    });
    setItemEditandoId(item.id);
    setCarritoAbierto(false);
  };

  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "16px",
      }}
    >
      <EncabezadoNegocio
        nombre={negocio.nombre}
        subtitulo={negocio.subtitulo}
        logo={negocio.logo}
        estadoNegocio={estadoNegocio}
        resumenHorarios={resumenHorarios}
      />

      <section style={{ marginBottom: "24px" }}>
        <style>{`
          .categorias-wrap {
            position: relative;
          }

          .categorias-carrusel {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 4px;
            user-select: none;
            -ms-overflow-style: none;
            scrollbar-width: none;
            touch-action: pan-x;
            cursor: grab;
          }

          .categorias-carrusel:active {
            cursor: grabbing;
          }

          .categorias-carrusel::-webkit-scrollbar {
            display: none;
          }

          .categorias-carrusel-item {
            flex: 0 0 auto;
            min-width: fit-content;
          }

          .indicador-lados {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            pointer-events: none;
          }

          .indicador-lado {
            height: 100%;
            width: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(107, 114, 128, 0.72);
          }

          .indicador-izquierda {
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.92) 0%,
              rgba(255, 255, 255, 0) 100%
            );
          }

          .indicador-derecha {
            background: linear-gradient(
              270deg,
              rgba(255, 255, 255, 0.92) 0%,
              rgba(255, 255, 255, 0) 100%
            );
          }

          .indicador-icono {
            width: 16px;
            height: 16px;
            opacity: 0.75;
            animation: indicadorPulso 2.1s ease-in-out infinite;
          }

          @keyframes indicadorPulso {
            0%,
            100% {
              opacity: 0.45;
              transform: translateX(0);
            }

            50% {
              opacity: 0.9;
              transform: translateX(1px);
            }
          }
        `}</style>
        <div className="categorias-wrap">
          <div
            className="categorias-carrusel"
            ref={carruselRef}
            onScroll={normalizarScrollCarrusel}
            onMouseDown={iniciarArrastreMouse}
            onMouseMove={moverArrastreMouse}
            onMouseUp={terminarArrastreMouse}
            onMouseLeave={manejarSalidaMouseCarrusel}
            onTouchStart={normalizarScrollCarrusel}
            onTouchEnd={() => setCategoriasAnimadas(true)}
            onTouchCancel={() => setCategoriasAnimadas(true)}
          >
            {categoriasLoop.map((categoria, index) => {
              const activa = categoria.id === categoriaActiva;

              return (
                <div
                  key={`${categoria.id}-${index}`}
                  className="categorias-carrusel-item"
                >
                  <BotonAnimado
                    type="button"
                    onClick={() => {
                      setCategoriaActiva(categoria.id);
                      setCategoriasAnimadas(true);
                    }}
                    style={{
                      padding: "14px 22px",
                      background: activa
                        ? "var(--color-primario)"
                        : "var(--color-superficie)",
                      border: activa
                        ? "1px solid var(--color-primario)"
                        : "1px solid var(--color-borde)",
                      borderRadius: "999px",
                      color: activa
                        ? "#ffffff"
                        : "var(--color-texto-secundario)",
                      fontWeight: 700,
                      boxShadow: activa ? "var(--sombra-suave)" : "none",
                      transition: "all var(--transition-base)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {categoria.nombre}
                  </BotonAnimado>
                </div>
              );
            })}
          </div>

          <div className="indicador-lados" aria-hidden="true">
            <span className="indicador-lado indicador-izquierda">
              <ChevronLeft className="indicador-icono" />
            </span>
            <span className="indicador-lado indicador-derecha">
              <ChevronRight className="indicador-icono" />
            </span>
          </div>
        </div>
      </section>

      <section>
        <p
          style={{
            marginBottom: "12px",
            color: "var(--color-texto-secundario)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Categoría: {categorias.find((c) => c.id === categoriaActiva)?.nombre}
        </p>

        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          {productosFiltrados.length === 0 ? (
            <p style={{ color: "gray" }}>No hay productos en esta categoría</p>
          ) : (
            productosFiltrados.map((producto) => (
              <TarjetaProducto
                key={producto.id}
                nombre={producto.nombre}
                descripcion={producto.descripcion}
                precio={producto.precio}
                imagen={producto.imagen}
                onAbrir={() => abrirConfiguracionProducto(producto)}
                onAgregar={() => abrirConfiguracionProducto(producto)}
              />
            ))
          )}
        </div>
      </section>

      <ModalProducto
        abierto={Boolean(productoActivo && configuracionActiva)}
        producto={productoActivo}
        configuracion={configuracionActiva}
        total={totalProducto}
        itemIdEditar={itemEditandoId}
        onCerrar={cerrarConfiguracionProducto}
        onDisminuirCantidad={disminuirCantidad}
        onAumentarCantidad={aumentarCantidad}
        onSeleccionar={seleccionarOpcion}
        onCambiarCantidadOpcion={cambiarCantidadOpcion}
      />

      <CarritoFlotante onClick={() => setCarritoAbierto(true)} />

      <ModalCarrito
        abierto={carritoAbierto}
        onClose={() => setCarritoAbierto(false)}
        onEditarItem={editarItemCarrito}
        negocio={negocio}
        estadoNegocio={estadoNegocio}
        resumenHorarios={resumenHorarios}
      />
    </main>
  );
}
