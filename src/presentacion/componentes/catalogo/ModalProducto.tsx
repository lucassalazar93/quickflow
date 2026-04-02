"use client";

import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { Producto } from "@/types/producto";
import type { ConfiguracionProducto } from "@/types/configuracion-producto";
import { GRUPOS_ADICIONES } from "@/config/adiciones";
import { useCarritoStore } from "@/store/carrito.store";

type ModalProductoProps = {
  abierto: boolean;
  producto: Producto | null;
  configuracion: ConfiguracionProducto | null;
  total: number;
  itemIdEditar?: string | null;
  onCerrar: () => void;
  onDisminuirCantidad: () => void;
  onAumentarCantidad: () => void;
  onSeleccionar: (grupoId: string, opcionId: string) => void;
  onCambiarCantidadOpcion: (
    grupoId: string,
    opcionId: string,
    delta: number,
  ) => void;
};

export function ModalProducto({
  abierto,
  producto,
  configuracion,
  total,
  itemIdEditar,
  onCerrar,
  onDisminuirCantidad,
  onAumentarCantidad,
  onSeleccionar,
  onCambiarCantidadOpcion,
}: ModalProductoProps) {
  const agregarItem = useCarritoStore((state) => state.agregarItem);
  const actualizarItem = useCarritoStore((state) => state.actualizarItem);
  const [imagenAmpliada, setImagenAmpliada] = useState(false);

  if (!abierto || !producto || !configuracion) {
    return null;
  }

  const cerrarModal = () => {
    setImagenAmpliada(false);
    onCerrar();
  };

  const grupos =
    producto.gruposAdicionesIds?.map((id) => GRUPOS_ADICIONES[id]) ?? [];

  const construirItemCarrito = () => {
    const gruposPorId = new Map(grupos.map((grupo) => [grupo.id, grupo]));

    const salsasSeleccionadas = configuracion.selecciones
      .filter((seleccion) => seleccion.grupoId === "salsas")
      .map((seleccion) => seleccion.opcionId);

    const adicionesSeleccionadas = configuracion.selecciones
      .filter((seleccion) => seleccion.grupoId === "adiciones")
      .map((seleccion) => {
        const grupo = gruposPorId.get(seleccion.grupoId);
        const opcion = grupo?.opciones.find(
          (item) => item.id === seleccion.opcionId,
        );

        return {
          id: seleccion.opcionId,
          nombre: opcion?.nombre ?? seleccion.opcionId,
          precio: opcion?.precio ?? 0,
          cantidad: seleccion.cantidad ?? 1,
        };
      });

    const totalAdiciones = adicionesSeleccionadas.reduce(
      (acc, adicion) => acc + adicion.precio * adicion.cantidad,
      0,
    );

    const totalUnitario = producto.precio + totalAdiciones;
    const totalFinal = totalUnitario * configuracion.cantidad;

    return {
      id: itemIdEditar ?? `${producto.id}-${Date.now()}`,
      productoId: producto.id,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precioBase: producto.precio,
      cantidad: configuracion.cantidad,
      salsas: salsasSeleccionadas,
      adiciones: adicionesSeleccionadas,
      total: totalFinal,
    };
  };

  const handleAgregar = () => {
    const item = construirItemCarrito();
    if (itemIdEditar) {
      actualizarItem(itemIdEditar, item);
    } else {
      agregarItem(item);
    }
    cerrarModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-producto-titulo"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={cerrarModal}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "var(--color-fondo, #ffffff)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          padding: "12px 12px 16px",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "var(--color-fondo, #ffffff)",
            paddingBottom: "8px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "5px",
              borderRadius: "999px",
              background: "var(--color-borde)",
              margin: "0 auto 12px",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-texto-secundario)",
                }}
              >
                Configura tu producto
              </p>

              <h2
                id="modal-producto-titulo"
                style={{
                  margin: "6px 0 4px",
                  fontSize: "22px",
                  lineHeight: 1.2,
                }}
              >
                {producto.nombre}
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--color-texto-secundario)",
                  lineHeight: 1.4,
                }}
              >
                {producto.descripcion}
              </p>
            </div>

            <button
              type="button"
              onClick={cerrarModal}
              style={{
                border: "1px solid var(--color-borde)",
                background: "var(--color-superficie)",
                borderRadius: "999px",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Cerrar modal"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {producto.imagen ? (
          <div
            style={{
              marginBottom: "10px",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid var(--color-borde)",
              background: "var(--color-superficie)",
              padding: "8px",
            }}
          >
            <img
              src={producto.imagen}
              alt={producto.nombre}
              onClick={() => setImagenAmpliada(true)}
              style={{
                display: "block",
                width: "100%",
                height: "clamp(160px, 28vh, 260px)",
                objectFit: "contain",
                objectPosition: "center",
                borderRadius: "12px",
                cursor: "zoom-in",
              }}
            />
          </div>
        ) : null}

        {grupos.map((grupo) => (
          <details
            key={grupo.id}
            open
            style={{
              marginBottom: "10px",
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid var(--color-borde)",
              background: "var(--color-superficie)",
            }}
          >
            <summary
              style={{
                listStyle: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "10px",
                fontWeight: 700,
              }}
            >
              <span>{grupo.nombre}</span>
              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "var(--color-fondo)",
                  border: "1px solid var(--color-borde)",
                  color: "var(--color-texto-secundario)",
                }}
              >
                {
                  configuracion.selecciones.filter(
                    (seleccion) => seleccion.grupoId === grupo.id,
                  ).length
                }
              </span>
            </summary>

            <div
              style={{
                display: "grid",
                gap: "8px",
                gridTemplateColumns: grupo.opciones.every(
                  (opcion) => !opcion.permiteCantidad,
                )
                  ? "repeat(auto-fit, minmax(140px, 1fr))"
                  : "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {grupo.opciones.map((opcion) => {
                const activa = configuracion.selecciones.some(
                  (seleccion) =>
                    seleccion.grupoId === grupo.id &&
                    seleccion.opcionId === opcion.id,
                );
                const seleccion = configuracion.selecciones.find(
                  (item) =>
                    item.grupoId === grupo.id && item.opcionId === opcion.id,
                );
                const cantidad = seleccion?.cantidad ?? 0;

                if (opcion.permiteCantidad) {
                  return (
                    <div
                      key={opcion.id}
                      style={{
                        padding: "10px",
                        borderRadius: "12px",
                        border: activa
                          ? "2px solid var(--color-primario)"
                          : "1px solid var(--color-borde)",
                        background: activa
                          ? "rgba(255, 0, 0, 0.08)"
                          : "var(--color-fondo)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{opcion.nombre}</span>
                        {opcion.precio > 0 && grupo.id !== "salsas" && (
                          <span style={{ fontWeight: 700 }}>
                            +${opcion.precio.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onCambiarCantidadOpcion(grupo.id, opcion.id, -1)
                          }
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            border: "1px solid var(--color-borde)",
                            background: "var(--color-fondo)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          aria-label={`Disminuir ${opcion.nombre}`}
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>

                        <span style={{ minWidth: "20px", textAlign: "center" }}>
                          {cantidad}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onCambiarCantidadOpcion(grupo.id, opcion.id, 1)
                          }
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            border: "1px solid var(--color-borde)",
                            background: "var(--color-fondo)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          aria-label={`Aumentar ${opcion.nombre}`}
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => onSeleccionar(grupo.id, opcion.id)}
                    style={{
                      padding: "10px",
                      borderRadius: "12px",
                      border: activa
                        ? "2px solid var(--color-primario)"
                        : "1px solid var(--color-borde)",
                      background: activa
                        ? "rgba(255, 0, 0, 0.08)"
                        : "var(--color-fondo)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                      minHeight: "44px",
                    }}
                  >
                    <span>{opcion.nombre}</span>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {opcion.precio > 0 && grupo.id !== "salsas" && (
                        <span style={{ fontWeight: 700 }}>
                          +${opcion.precio.toLocaleString()}
                        </span>
                      )}

                      {activa && (
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "var(--color-primario)",
                          }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </details>
        ))}

        <section
          style={{
            marginBottom: "20px",
            padding: "16px",
            borderRadius: "18px",
            border: "1px solid var(--color-borde)",
            background: "var(--color-superficie)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-texto-secundario)",
            }}
          >
            Cantidad
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            <button
              type="button"
              onClick={onDisminuirCantidad}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid var(--color-borde)",
                background: "var(--color-fondo, #fff)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Minus size={18} aria-hidden="true" />
            </button>

            <div
              style={{
                minWidth: "48px",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              {configuracion.cantidad}
            </div>

            <button
              type="button"
              onClick={onAumentarCantidad}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid var(--color-borde)",
                background: "var(--color-fondo, #fff)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
        </section>

        <div
          style={{
            position: "sticky",
            bottom: 0,
            paddingTop: "12px",
            background:
              "linear-gradient(to top, var(--color-fondo, #fff) 70%, rgba(255,255,255,0))",
          }}
        >
          <button
            type="button"
            onClick={handleAgregar}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "16px",
              padding: "16px 18px",
              background: "var(--color-primario)",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "var(--sombra-suave)",
            }}
          >
            Agregar al pedido - ${total.toLocaleString()}
          </button>
        </div>
      </div>

      {imagenAmpliada && producto.imagen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setImagenAmpliada(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderBottom: "1px solid var(--color-borde)",
                background: "var(--color-superficie)",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-texto-secundario)",
                  }}
                >
                  Vista ampliada
                </p>
                <h3 style={{ margin: "6px 0 0", fontSize: "18px" }}>
                  {producto.nombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImagenAmpliada(false)}
                aria-label="Cerrar imagen"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "999px",
                  border: "1px solid var(--color-borde)",
                  background: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div style={{ padding: "12px" }}>
              <div
                style={{
                  borderRadius: "16px",
                  background: "var(--color-superficie)",
                  padding: "8px",
                }}
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "clamp(220px, 45vh, 420px)",
                    objectFit: "contain",
                    borderRadius: "12px",
                  }}
                />
              </div>

              <div style={{ marginTop: "12px" }}>
                <p
                  style={{
                    margin: 0,
                    color: "var(--color-texto-secundario)",
                    fontSize: "14px",
                    lineHeight: 1.4,
                  }}
                >
                  {producto.descripcion}
                </p>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "var(--color-primario)",
                  }}
                >
                  ${producto.precio.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
