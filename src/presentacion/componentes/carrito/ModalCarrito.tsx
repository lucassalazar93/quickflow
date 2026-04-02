"use client";

import { useState } from "react";
import { Pencil, Store, Trash2, Truck, X } from "lucide-react";
import { useCarritoStore } from "@/store/carrito.store";
import type { ItemCarrito } from "@/types/carrito";
import { GRUPOS_ADICIONES } from "@/config/adiciones";
import styles from "./ModalCarrito.module.css";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onEditarItem: (item: ItemCarrito) => void;
}

export function ModalCarrito({ abierto, onClose, onEditarItem }: Props) {
  const items = useCarritoStore((s) => s.items);
  const eliminarItem = useCarritoStore((s) => s.eliminarItem);
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

  if (!abierto) return null;

  const total = items.reduce((acc, i) => acc + i.total, 0);
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
  const formularioValido = nombreValido && telefonoValido && direccionValida;
  const metodoMixtoValido =
    metodoPago !== "mixto" ||
    (montoTransferencia.trim().length > 0 && montoEfectivo.trim().length > 0);
  const formularioCompleto = formularioValido && metodoMixtoValido;

  const generarMensaje = () => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    const tipoEntregaLabel =
      tipoEntrega === "domicilio" ? "Domicilio" : "Recoger";
    const metodoPagoLabel =
      metodoPago === "efectivo"
        ? "Efectivo"
        : metodoPago === "transferencia"
          ? "Transferencia"
          : "Mixto";

    let mensaje =
      "👋 Hola, soy Geral, tu asistente el dia de hoy en mandingas la 37.\n";
    mensaje += "Gracias por tu pedido, aqui esta el resumen:\n\n";
    mensaje += "🛒 *Pedido Mandingas la 37*\n\n";

    mensaje += `📍 Entrega: ${tipoEntregaLabel}\n`;
    mensaje += `🙋 Nombre: ${nombre.trim()}\n`;
    mensaje += `📞 Telefono: ${telefonoLimpio}\n`;
    if (tipoEntrega === "domicilio") {
      mensaje += `🏠 Direccion: ${direccion.trim()}\n`;
      if (observaciones.trim().length > 0) {
        mensaje += `📝 Observaciones: ${observaciones.trim()}\n`;
      }
    }
    mensaje += `💳 Metodo de pago: ${metodoPagoLabel}\n`;
    if (metodoPago === "mixto") {
      mensaje += `🏦 Transferencia: ${montoTransferencia.trim()}\n`;
      mensaje += `💵 Efectivo: ${montoEfectivo.trim()}\n`;
    }
    mensaje += "\n";
    mensaje += "🍽 *Productos*\n";

    items.forEach((item) => {
      mensaje += `• *${item.cantidad}x ${item.nombre}*\n`;

      if (item.salsas.length > 0) {
        const salsas = item.salsas.map((id) => salsasPorId.get(id) ?? id);
        mensaje += `  🌶 Salsas: ${salsas.join(", ")}\n`;
      }

      item.adiciones.forEach((a) => {
        mensaje += `  ➕ ${a.nombre} x${a.cantidad}\n`;
      });

      mensaje += `  Subtotal: $${item.total.toLocaleString()}\n\n`;
    });

    mensaje += `💰 *Total: $${total.toLocaleString()}*\n`;
    mensaje += "✅ Pedido listo para confirmar\n\n";
    mensaje += "Si necesitas algo mas, aqui estoy para ayudarte. 😊";

    const url = `https://wa.me/573150399322?text=${encodeURIComponent(
      mensaje,
    )}`;

    window.open(url, "_blank");
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

                    {item.adiciones.map((a) => (
                      <p key={a.id} className={styles.detalle}>
                        + {a.nombre} x{a.cantidad}
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
                Nombre
              </label>
              <input
                id="nombre"
                className={styles.input}
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Tu nombre"
              />
              {!nombreValido && (
                <p className={styles.error}>Ingresa tu nombre.</p>
              )}
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="telefono">
                Telefono
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
                  El telefono debe tener minimo 10 digitos.
                </p>
              )}
            </div>

            {tipoEntrega === "domicilio" && (
              <>
                <div className={styles.campo}>
                  <label className={styles.label} htmlFor="direccion">
                    Direccion
                  </label>
                  <input
                    id="direccion"
                    className={styles.input}
                    value={direccion}
                    onChange={(event) => setDireccion(event.target.value)}
                    placeholder="Calle 10 # 5 - 20"
                  />
                  {!direccionValida && (
                    <p className={styles.error}>
                      Ingresa la direccion para el domicilio.
                    </p>
                  )}
                </div>

                <div className={styles.campo}>
                  <label className={styles.label} htmlFor="observaciones">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    className={styles.textarea}
                    value={observaciones}
                    onChange={(event) => setObservaciones(event.target.value)}
                    placeholder="Ej: Casa blanca al final de la cuadra"
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
                  <label className={styles.label} htmlFor="montoTransferencia">
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
                    onChange={(event) => setMontoEfectivo(event.target.value)}
                    placeholder="Ej: 8000"
                    inputMode="numeric"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>Total: ${total.toLocaleString()}</div>

            {!checkoutVisible ? (
              <div className={styles.ctaGroup}>
                <button
                  className={`${styles.ctaButton} ${
                    tipoEntrega === "domicilio" ? styles.ctaButtonActive : ""
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
                Enviar pedido por WhatsApp
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
