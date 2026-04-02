"use client";

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { cargarNegocio } from "@/infraestructura/negocios";
import { actualizarCantidadProducto } from "@/aplicacion/catalogo/actualizarCantidadProducto";
import { actualizarSeleccionGrupo } from "@/aplicacion/catalogo/actualizarSeleccionGrupo";
import { calcularTotalProducto } from "@/aplicacion/catalogo/calcularTotalProducto";
import { inicializarConfiguracionProducto } from "@/aplicacion/catalogo/inicializarConfiguracionProducto";
import type { Producto } from "@/types/producto";
import type { ConfiguracionProducto } from "@/types/configuracion-producto";
import type { ItemCarrito } from "@/types/carrito";
import { EncabezadoNegocio } from "@/presentacion/componentes/negocio/EncabezadoNegocio";
import { BotonAnimado } from "@/presentacion/componentes/comunes/BotonAnimado";
import { TarjetaProducto } from "@/presentacion/componentes/catalogo/TarjetaProducto";
import { ModalProducto } from "@/presentacion/componentes/catalogo/ModalProducto";
import { CarritoFlotante } from "@/presentacion/componentes/carrito/CarritoFlotante";
import { ModalCarrito } from "@/presentacion/componentes/carrito/ModalCarrito";

export default function PaginaNegocio() {
  const params = useParams<{ negocio: string }>();
  const slug = params.negocio;

  const configuracion = cargarNegocio(slug);

  if (!configuracion) {
    notFound();
  }

  const { negocio, categorias, productos } = configuracion;

  const [categoriaActiva, setCategoriaActiva] = useState(
    categorias[0]?.id ?? "",
  );

  const [productoActivo, setProductoActivo] = useState<Producto | null>(null);
  const [configuracionActiva, setConfiguracionActiva] =
    useState<ConfiguracionProducto | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);

  const productosFiltrados = productos.filter(
    (producto) => producto.categoriaId === categoriaActiva,
  );

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

    setConfiguracionActiva(nueva);
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
        abierto={negocio.abierto}
      />

      <section style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "none",
          }}
        >
          {categorias.map((categoria) => {
            const activa = categoria.id === categoriaActiva;

            return (
              <BotonAnimado
                key={categoria.id}
                type="button"
                onClick={() => setCategoriaActiva(categoria.id)}
                style={{
                  flex: "0 0 auto",
                  minWidth: "fit-content",
                  padding: "14px 22px",
                  background: activa
                    ? "var(--color-primario)"
                    : "var(--color-superficie)",
                  border: activa
                    ? "1px solid var(--color-primario)"
                    : "1px solid var(--color-borde)",
                  borderRadius: "999px",
                  color: activa ? "#ffffff" : "var(--color-texto-secundario)",
                  fontWeight: 700,
                  boxShadow: activa ? "var(--sombra-suave)" : "none",
                  transition: "all var(--transition-base)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {categoria.nombre}
              </BotonAnimado>
            );
          })}
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
      />
    </main>
  );
}
