"use client";

import { useMemo, useState } from "react";
import { Pencil, Store, Trash2, Truck, X } from "lucide-react";
import { useCarritoStore } from "@/store/carrito.store";
import type { ItemCarrito } from "@/types/carrito";
import type { Negocio } from "@/types/negocio";
import { GRUPOS_ADICIONES } from "@/config/adiciones";
import { calcularDomicilio } from "@/dominio/domicilios/calcularDomicilio";
import {
  extraerCalle,
  extraerCarrera,
} from "@/dominio/domicilios/parseDireccion";
import { construirEnlaceGoogleMaps } from "@/utils/construirEnlaceGoogleMaps";
import styles from "./ModalCarrito.module.css";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onEditarItem: (item: ItemCarrito) => void;
  negocio: Negocio;
}

export function ModalCarrito({
  abierto,
  onClose,
  onEditarItem,
  negocio,
}: Props) {
  const items = useCarritoStore((s) => s.items);
  const eliminarItem = useCarritoStore((s) => s.eliminarItem);
  const limpiarCarrito = useCarritoStore((s) => s.limpiar);

  const [tipoEntrega, setTipoEntrega] = useState<"domicilio" | "recoger">(
    "domicilio",
  );
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [metodoPago, setMetodoPago] = useState<
    "efectivo" | "transferencia" | "mixto"
  >("efectivo");
  const [montoTransferencia, setMontoTransferencia] = useState("");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  const subtotalProductos = items.reduce((acc, item) => acc + item.total, 0);

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

    // Cálculo de domicilio basado solo en calle/carrera por texto
    const calle = extraerCalle(direccion);
    const carrera = extraerCarrera(direccion);
    const resultado = calcularDomicilio({
      calle,
      carrera,
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
  }, [tipoEntrega, direccion]);

  const esDomicilioFallback =
    tipoEntrega === "domicilio" && resultadoDomicilio.requiereConfirmacion;

  const valorDomicilio = esDomicilioFallback ? 0 : resultadoDomicilio.valor;
  const totalFinal = subtotalProductos + valorDomicilio;

  const salsasPorId = new Map(
    GRUPOS_ADICIONES.salsas.opciones.map((opcion) => [
      opcion.id,
      opcion.nombre,
    ]),
  );

  const nombreValido = nombre.trim().length > 0;
  const telefonoValido = telefono.replace(/\D/g, "").length >= 10;
  const direccionValida =
    tipoEntrega === "recoger" || direccion.trim().length > 0;

  const domicilioValido =
    tipoEntrega === "recoger" || resultadoDomicilio.estado === "OK";

  const formularioValido =
    nombreValido && telefonoValido && direccionValida && domicilioValido;

  const metodoMixtoValido =
    metodoPago !== "mixto" ||
    (montoTransferencia.trim().length > 0 && montoEfectivo.trim().length > 0);

  const formularioCompleto = formularioValido && metodoMixtoValido;

  const limpiarCheckout = () => {
    setNombre("");
    setTelefono("");
    setDireccion("");
    setObservaciones("");
    setMetodoPago("efectivo");
    setMontoTransferencia("");
    setMontoEfectivo("");
    setTipoEntrega("domicilio");
    setCheckoutVisible(false);
    limpiarCarrito();
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

    const esDomicilioFallback =
      tipoEntrega === "domicilio" && resultadoDomicilio.requiereConfirmacion;

    let mensaje = "";

    // Encabezado profesional
    mensaje += "🍟 *MANDINGAS LA 37* 🍟\n";
    mensaje += "_Gracias por tu pedido_\n\n";

    // Alerta si es necesario confirmación
    if (esDomicilioFallback) {
      mensaje += "⚠️ *NOTA IMPORTANTE*\n";
      mensaje += resultadoDomicilio.mensaje + "\n";
      mensaje += "_El valor será confirmado al procesar tu pedido._\n\n";
    }

    // Información del cliente
    mensaje += "👤 *CLIENTE*\n";
    mensaje += `Nombre: ${nombre.trim()}\n`;
    mensaje += `Teléfono: ${telefonoLimpio}\n\n`;

    // Información de entrega
    mensaje += "📍 *ENTREGA*\n";
    mensaje += `Tipo: ${tipoEntregaLabel}\n`;

    if (tipoEntrega === "domicilio") {
      mensaje += `Dirección: ${direccion.trim()}\n`;

      if (direccion.trim().length > 0) {
        const enlaceMaps = construirEnlaceGoogleMaps({
          direccion: direccion.trim(),
        });
        if (enlaceMaps) {
          mensaje += `🗺️ Ubicación: ${enlaceMaps}\n`;
        }
      }

      if (resultadoDomicilio.estado === "OK") {
        mensaje += `Zona: ${resultadoDomicilio.zona}\n`;
      }

      if (observaciones.trim().length > 0) {
        mensaje += `Indicaciones: ${observaciones.trim()}\n`;
      }
    }

    mensaje += "\n";

    // Productos
    mensaje += "🧺 *PRODUCTOS*\n";
    mensaje += "─".repeat(40) + "\n";

    items.forEach((item) => {
      mensaje += `${item.cantidad}x ${item.nombre}\n`;

      if (item.salsas.length > 0) {
        const salsas = item.salsas.map((id) => salsasPorId.get(id) ?? id);
        mensaje += `   └─ Salsas: ${salsas.join(", ")}\n`;
      }

      item.adiciones.forEach((adicion) => {
        mensaje += `   └─ +${adicion.nombre} (x${adicion.cantidad})\n`;
      });

      mensaje += `   💲 ${item.total.toLocaleString()}\n\n`;
    });

    // Datos de pago
    mensaje += "💳 *PAGO*\n";
    mensaje += "─".repeat(40) + "\n";
    mensaje += `Método: ${metodoPagoLabel}\n`;

    if (metodoPago === "mixto") {
      mensaje += `Transferencia: $${montoTransferencia.trim()}\n`;
      mensaje += `Efectivo: $${montoEfectivo.trim()}\n`;
    }

    mensaje += "\n";

    // Resumen total
    mensaje += "═".repeat(40) + "\n";
    mensaje += `🧺 Subtotal: $${subtotalProductos.toLocaleString()}\n`;

    if (tipoEntrega === "domicilio") {
      if (esDomicilioFallback) {
        mensaje += "🛵 Domicilio: Por confirmar\n";
      } else {
        mensaje += `🛵 Domicilio: $${valorDomicilio.toLocaleString()}\n`;
      }
    }

    mensaje += `\n💰 *TOTAL: $${totalFinal.toLocaleString()}*\n`;
    mensaje += "═".repeat(40) + "\n\n";

    // Mensaje final personalizado
    mensaje += "Gracias por confiar en nosotros. 🙏\n";
    mensaje += "Tu pedido será confirmado en los próximos minutos.\n";
    mensaje += "¡Recibirás actualizaciones por este chat! 📲";

    const url = `https://wa.me/573150399322?text=${encodeURIComponent(
      mensaje,
    )}`;

    window.open(url, "_blank");
    limpiarCheckout();
    onClose();
  };

  const handleClose = () => {
    setCheckoutVisible(false);
    onClose();
  };

  const iniciarCheckout = (tipo: "domicilio" | "recoger") => {
    setTipoEntrega(tipo);
    setCheckoutVisible(true);
  };

  return (
    <>
      {abierto && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>Tu pedido</h2>
              <div className={styles.headerActions}>
                {checkoutVisible && (
                  <button
                    className={styles.editar}
                    onClick={() => setCheckoutVisible(false)}
                    type="button"
                    aria-label="Editar pedido"
                    title="Editar pedido"
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className={styles.cerrar}
                  aria-label="Cerrar carrito"
                  type="button"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={styles.contenedorScrolleable}>
              <div className={styles.lista}>
                {items.length === 0 ? (
                  <p className={styles.vacio}>Tu carrito esta vacio</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className={styles.item}>
                      <div className={styles.itemContenido}>
                        <div className={styles.itemMedia}>
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className={styles.itemImagen}
                          />
                        </div>

                        <div className={styles.itemInfo}>
                          <strong className={styles.itemTitulo}>
                            {item.cantidad}x {item.nombre}
                          </strong>

                          {item.salsas.length > 0 && (
                            <p className={styles.detalle}>
                              Salsas:{" "}
                              {item.salsas
                                .map((id) => salsasPorId.get(id) ?? id)
                                .join(", ")}
                            </p>
                          )}

                          {item.adiciones.map((adicion) => (
                            <p key={adicion.id} className={styles.detalle}>
                              + {adicion.nombre} x{adicion.cantidad}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className={styles.right}>
                        <span>${item.total.toLocaleString()}</span>

                        <div className={styles.itemButtons}>
                          <button
                            className={styles.editarItem}
                            onClick={() => onEditarItem(item)}
                            type="button"
                            aria-label={`Editar ${item.nombre}`}
                            title="Editar"
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </button>

                          <button
                            className={styles.eliminar}
                            onClick={() => eliminarItem(item.id)}
                            type="button"
                            aria-label={`Eliminar ${item.nombre}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && checkoutVisible && (
                <div className={styles.formulario}>
                  <div className={styles.toggleGroup}>
                    <button
                      type="button"
                      className={`${styles.toggleButton} ${
                        tipoEntrega === "domicilio" ? styles.activo : ""
                      }`}
                      onClick={() => setTipoEntrega("domicilio")}
                    >
                      Domicilio
                    </button>

                    <button
                      type="button"
                      className={`${styles.toggleButton} ${
                        tipoEntrega === "recoger" ? styles.activo : ""
                      }`}
                      onClick={() => setTipoEntrega("recoger")}
                    >
                      Recoger
                    </button>
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label} htmlFor="nombre">
                      👤 Tu nombre
                    </label>
                    <input
                      id="nombre"
                      className={styles.input}
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)}
                      placeholder="Ej: Juan Pérez"
                    />
                    {!nombreValido && (
                      <p className={styles.error}>
                        Por favor, ingresa tu nombre.
                      </p>
                    )}
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label} htmlFor="telefono">
                      📞 Teléfono de contacto
                    </label>
                    <input
                      id="telefono"
                      className={styles.input}
                      value={telefono}
                      onChange={(event) => setTelefono(event.target.value)}
                      placeholder="Ej: 3001234567"
                      inputMode="numeric"
                    />
                    {!telefonoValido && (
                      <p className={styles.error}>
                        Necesitamos un teléfono con al menos 10 dígitos.
                      </p>
                    )}
                  </div>

                  {tipoEntrega === "domicilio" && (
                    <>
                      <div className={styles.campo}>
                        <label className={styles.label} htmlFor="direccion">
                          📍 Dirección de entrega
                        </label>

                        <input
                          id="direccion"
                          className={styles.input}
                          value={direccion}
                          onChange={(event) => setDireccion(event.target.value)}
                          placeholder="Ej: Calle 80 # 36-20, Apto 502"
                        />

                        {!direccionValida && (
                          <p className={styles.error}>
                            Por favor, ingresa una dirección válida.
                          </p>
                        )}

                        <p
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          Ej: Calle 80 # 36-20, Calle 81 # 76-25
                        </p>

                        {resultadoDomicilio.estado === "OK" && (
                          <>
                            {esDomicilioFallback ? (
                              <p className={styles.detalle}>
                                🛵 Domicilio estimado: $
                                {resultadoDomicilio.valor.toLocaleString()}
                              </p>
                            ) : (
                              <p className={styles.detalle}>
                                🛵 Domicilio: ${valorDomicilio.toLocaleString()}{" "}
                                · {resultadoDomicilio.zona}
                              </p>
                            )}

                            {esDomicilioFallback && (
                              <p
                                style={{
                                  color: "#f59e0b",
                                  fontSize: "13px",
                                  marginTop: "8px",
                                  padding: "8px 12px",
                                  background: "rgba(245, 158, 11, 0.08)",
                                  borderRadius: "6px",
                                  borderLeft: "3px solid #f59e0b",
                                  fontWeight: "500",
                                }}
                              >
                                ⚠️ Domicilio estimado · Sujeto a confirmación
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      <div className={styles.campo}>
                        <label className={styles.label} htmlFor="observaciones">
                          💬 Indicaciones especiales (opcional)
                        </label>
                        <textarea
                          id="observaciones"
                          className={styles.textarea}
                          value={observaciones}
                          onChange={(event) =>
                            setObservaciones(event.target.value)
                          }
                          placeholder="Ej: Casa blanca, portón negro, o cualquier indicación que nos ayude a encontrarte"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  <div className={styles.campo}>
                    <label className={styles.label} htmlFor="metodoPago">
                      Metodo de pago
                    </label>
                    <select
                      id="metodoPago"
                      className={styles.select}
                      value={metodoPago}
                      onChange={(event) =>
                        setMetodoPago(event.target.value as typeof metodoPago)
                      }
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="mixto">Mixto</option>
                    </select>
                  </div>

                  {metodoPago === "mixto" && (
                    <div className={styles.montos}>
                      <div className={styles.campo}>
                        <label
                          className={styles.label}
                          htmlFor="montoTransferencia"
                        >
                          Valor en transferencia
                        </label>
                        <input
                          id="montoTransferencia"
                          className={styles.input}
                          value={montoTransferencia}
                          onChange={(event) =>
                            setMontoTransferencia(event.target.value)
                          }
                          placeholder="Ej: 12000"
                          inputMode="numeric"
                        />
                      </div>

                      <div className={styles.campo}>
                        <label className={styles.label} htmlFor="montoEfectivo">
                          Valor en efectivo
                        </label>
                        <input
                          id="montoEfectivo"
                          className={styles.input}
                          value={montoEfectivo}
                          onChange={(event) =>
                            setMontoEfectivo(event.target.value)
                          }
                          placeholder="Ej: 8000"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className={styles.footer}>
                <div className={styles.total}>
                  {esDomicilioFallback ? "Total estimado" : "Total"}: $
                  {totalFinal.toLocaleString()}
                </div>

                {tipoEntrega === "domicilio" &&
                  checkoutVisible &&
                  resultadoDomicilio.estado === "OK" && (
                    <>
                      {esDomicilioFallback ? (
                        <div className={styles.detalle}>
                          Domicilio estimado: $
                          {resultadoDomicilio.valor.toLocaleString()}
                        </div>
                      ) : (
                        <div className={styles.detalle}>
                          Domicilio: ${valorDomicilio.toLocaleString()} ·{" "}
                          {resultadoDomicilio.zona}
                        </div>
                      )}

                      {esDomicilioFallback && (
                        <div
                          style={{
                            color: "#f59e0b",
                            fontSize: "12px",
                            marginTop: "6px",
                            padding: "6px 10px",
                            background: "rgba(245, 158, 11, 0.08)",
                            borderRadius: "4px",
                            borderLeft: "3px solid #f59e0b",
                            textAlign: "center",
                            fontWeight: "500",
                          }}
                        >
                          ⚠️ Estimado · Requiere confirmación
                        </div>
                      )}
                    </>
                  )}

                {!checkoutVisible ? (
                  <div className={styles.ctaGroup}>
                    <button
                      className={`${styles.ctaButton} ${
                        tipoEntrega === "domicilio"
                          ? styles.ctaButtonActive
                          : ""
                      }`}
                      onClick={() => iniciarCheckout("domicilio")}
                      type="button"
                    >
                      <span className={styles.ctaIcon} aria-hidden="true">
                        <Truck size={18} />
                      </span>
                      Domicilio
                    </button>

                    <button
                      className={`${styles.ctaButton} ${
                        tipoEntrega === "recoger" ? styles.ctaButtonActive : ""
                      }`}
                      onClick={() => iniciarCheckout("recoger")}
                      type="button"
                    >
                      <span className={styles.ctaIcon} aria-hidden="true">
                        <Store size={18} />
                      </span>
                      Recoger en tienda
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.boton}
                    onClick={generarMensaje}
                    disabled={!formularioCompleto}
                    type="button"
                  >
                    Pedir ahora 🛵
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
