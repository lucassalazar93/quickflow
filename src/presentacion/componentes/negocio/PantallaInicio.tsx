"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Bike, Clock3, Store } from "lucide-react";
import type { Negocio } from "@/types/negocio";
import type {
  ResultadoEstadoNegocio,
  ResumenHorariosVisible,
} from "@/dominio/horarios/obtenerEstadoNegocio";
import { leerCliente } from "@/aplicacion/cliente/clienteRecordado";
import { FirmaQuickFlow } from "@/presentacion/componentes/comunes/FirmaQuickFlow";
import { FilasHorario } from "@/presentacion/componentes/negocio/HojaHorarios";
import { tiempoRestante } from "@/presentacion/utilidades/formato";

// Curvas de la guía de animación del proyecto (entradas/salidas y movimiento en pantalla)
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";
const CLAVE_VISTA = "quickflow_intro_vista";
const ESPERA_AUTOMATICA_MS = 2400;

// Destellos alrededor del letrero: [x %, y %, tamaño px]
const DESTELLOS = [
  [-7, 16, 22],
  [100, 8, 16],
  [94, 74, 20],
  [-3, 66, 14],
  [20, -7, 14],
  [76, -5, 18],
];

function prefiereMenosMovimiento(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function yaLaVio(): boolean {
  try {
    return window.sessionStorage.getItem(CLAVE_VISTA) === "1";
  } catch {
    return false;
  }
}

function Palabras({ texto, desde }: { texto: string; desde: number }) {
  return (
    <>
      {texto.split(" ").map((palabra, indice) => (
        <span key={`${palabra}-${indice}`}>
          <span
            className="w"
            style={{ "--i": desde + indice } as React.CSSProperties}
          >
            {palabra}
          </span>{" "}
        </span>
      ))}
    </>
  );
}

type PropsPortada = { negocio: Negocio };

// Misma escena, quieta: cubre la página mientras carga la app en el teléfono
export function PortadaInicio({ negocio }: PropsPortada) {
  return (
    <div className="intro off pre" aria-hidden="true">
      <div className="i-bg" />
      <div className="i-top">
        <div className="i-rotulo">
          <img
            className="base"
            src={negocio.logoRotulo ?? negocio.logo}
            alt=""
            width={520}
            height={520}
          />
        </div>
      </div>
    </div>
  );
}

type Props = {
  negocio: Negocio;
  estadoNegocio: ResultadoEstadoNegocio;
  resumenHorarios: ResumenHorariosVisible;
  // Se llama cuando la pantalla termina (o cuando no hace falta mostrarla)
  onSalir: () => void;
};

// Primera apertura: la anfitriona enciende el letrero y da paso al menú.
// Con la tienda cerrada el letrero queda apagado y la pantalla solo informa.
export function PantallaInicio({
  negocio,
  estadoNegocio,
  resumenHorarios,
  onSalir,
}: Props) {
  const cerrado = estadoNegocio.estado === "cerrado";

  const [omitir] = useState(() => !cerrado && yaLaVio());
  const [nombreCliente] = useState(
    () => leerCliente().nombre.trim().split(/\s+/)[0] ?? "",
  );
  const [lista, setLista] = useState(false);
  const [encendido, setEncendido] = useState(false);
  const [horariosVisibles, setHorariosVisibles] = useState(false);

  const raizRef = useRef<HTMLDivElement | null>(null);
  const rotuloRef = useRef<HTMLDivElement | null>(null);
  const anfitrionaRef = useRef<HTMLImageElement | null>(null);
  const chispaRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const saliendoRef = useRef(false);

  // El letrero solo puede estar encendido si la tienda está abierta
  const luzEncendida = encendido && !cerrado;

  const salir = useCallback(() => {
    const raiz = raizRef.current;

    if (!raiz || saliendoRef.current) {
      return;
    }

    saliendoRef.current = true;

    try {
      window.sessionStorage.setItem(CLAVE_VISTA, "1");
    } catch {
      // Sin almacenamiento: se mostrará de nuevo en la próxima carga
    }

    const rotulo = rotuloRef.current;
    const destino = document.querySelector<HTMLElement>(".qf .top .logo");

    if (prefiereMenosMovimiento() || !rotulo || !destino || !raiz.animate) {
      onSalir();
      return;
    }

    // El letrero vuela a su lugar en el encabezado; el resto sale por donde entró
    const origen = rotulo.getBoundingClientRect();
    const fin = destino.getBoundingClientRect();
    const dx = fin.left + fin.width / 2 - (origen.left + origen.width / 2);
    const dy = fin.top + fin.height / 2 - (origen.top + origen.height / 2);
    const escala = fin.width / origen.width;
    const salida = { duration: 320, easing: EASE_OUT, fill: "forwards" as const };

    panelRef.current?.animate(
      [{ transform: "none" }, { transform: "translateY(105%)" }],
      salida,
    );
    anfitrionaRef.current?.animate(
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(6%)" },
      ],
      salida,
    );
    raiz.querySelectorAll<HTMLElement>(".i-bg, .i-velo").forEach((capa) => {
      capa.animate([{ opacity: getComputedStyle(capa).opacity }, { opacity: 0 }], {
        duration: 420,
        delay: 140,
        easing: EASE_OUT,
        fill: "both",
      });
    });
    raiz.querySelectorAll<HTMLElement>(".i-est").forEach((destello) => {
      destello.style.display = "none";
    });

    const vuelo = rotulo.animate(
      [
        { transform: "none", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${escala})`,
          opacity: 1,
          offset: 0.82,
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${escala})`,
          opacity: 0,
        },
      ],
      { duration: 620, easing: EASE_IN_OUT, fill: "forwards" },
    );

    // La salida no depende de que la animación llegue a terminar (pestaña en segundo plano)
    const respaldo = window.setTimeout(onSalir, 900);
    vuelo.finished.finally(() => {
      window.clearTimeout(respaldo);
      onSalir();
    });
  }, [onSalir]);

  useEffect(() => {
    if (omitir) {
      onSalir();
      return;
    }

    const raiz = raizRef.current;

    if (!raiz) {
      return;
    }

    let vigente = true;
    const imagenes = Array.from(raiz.querySelectorAll("img"));
    const cargadas = Promise.all(
      imagenes.map((imagen) => imagen.decode().catch(() => undefined)),
    );
    const limite = new Promise((resolver) => window.setTimeout(resolver, 1500));

    Promise.race([cargadas, limite]).then(() => {
      if (vigente) {
        setLista(true);
      }
    });

    return () => {
      vigente = false;
    };
  }, [omitir, onSalir]);

  // La luz y los rayos nacen del centro del letrero
  useEffect(() => {
    if (!lista) {
      return;
    }

    const centrar = () => {
      const rotulo = rotuloRef.current?.getBoundingClientRect();

      if (rotulo) {
        raizRef.current?.style.setProperty(
          "--cy",
          `${rotulo.top + rotulo.height / 2}px`,
        );
      }
    };

    centrar();
    window.addEventListener("resize", centrar);

    const foco = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("button")
        ?.focus({ preventScroll: true });
    }, 950);

    return () => {
      window.removeEventListener("resize", centrar);
      window.clearTimeout(foco);
    };
  }, [lista]);

  // Abierto: de ella sale una chispa que viaja al letrero y lo enciende
  useEffect(() => {
    if (!lista || cerrado || encendido) {
      return;
    }

    const encender = () => setEncendido(true);
    const sinMovimiento = prefiereMenosMovimiento();

    const inicio = window.setTimeout(
      () => {
        const anfitriona = anfitrionaRef.current;
        const rotulo = rotuloRef.current;
        const chispa = chispaRef.current;

        if (sinMovimiento || !anfitriona || !rotulo || !chispa?.animate) {
          encender();
          return;
        }

        const a = anfitriona.getBoundingClientRect();
        const l = rotulo.getBoundingClientRect();
        const x0 = a.left + a.width * 0.62;
        const y0 = a.top + a.width * 0.6;
        const x1 = l.left + l.width / 2;
        const y1 = l.top + l.height / 2;

        anfitriona.animate(
          [
            { transform: "none" },
            { transform: "translateY(-9px)" },
            { transform: "none" },
          ],
          { duration: 420, easing: EASE_IN_OUT },
        );

        chispa
          .animate(
            [
              { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0 },
              {
                transform: `translate(${x0}px, ${y0 - 10}px) scale(0.9)`,
                opacity: 1,
                offset: 0.15,
              },
              {
                transform: `translate(${(x0 + x1) / 2 + 54}px, ${(y0 + y1) / 2}px) scale(1.1)`,
                opacity: 1,
                offset: 0.6,
              },
              {
                transform: `translate(${x1}px, ${y1}px) scale(1.5)`,
                opacity: 1,
                offset: 0.92,
              },
              { transform: `translate(${x1}px, ${y1}px) scale(3)`, opacity: 0 },
            ],
            { duration: 520, easing: EASE_IN_OUT },
          )
          .finished.finally(encender);
      },
      sinMovimiento ? 0 : 780,
    );

    // Si la animación no llega a correr, el letrero se enciende igual
    const respaldo = window.setTimeout(encender, 1700);

    return () => {
      window.clearTimeout(inicio);
      window.clearTimeout(respaldo);
    };
  }, [lista, cerrado, encendido]);

  // Encendido: entra sola al menú; Esc o un toque la adelantan
  useEffect(() => {
    if (!luzEncendida) {
      return;
    }

    const automatico = window.setTimeout(salir, ESPERA_AUTOMATICA_MS);
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        salir();
      }
    };

    window.addEventListener("keydown", alPresionar);

    return () => {
      window.clearTimeout(automatico);
      window.removeEventListener("keydown", alPresionar);
    };
  }, [luzEncendida, salir]);

  if (omitir) {
    return null;
  }

  const saludo = nombreCliente ? `¡Hola de nuevo, ${nombreCliente}!` : "¡Hola!";
  const titular = cerrado
    ? "En este momento estamos cerrados."
    : "Ya estamos abiertos.";
  const apertura = estadoNegocio.proximaApertura;

  let detalleAbierto = estadoNegocio.lineaCorta;

  if (estadoNegocio.estado === "domicilios_no_disponibles") {
    detalleAbierto = `${estadoNegocio.lineaCorta}. Por ahora, para recoger.`;
  } else if (estadoNegocio.estado === "domicilios_cerrados") {
    detalleAbierto = estadoNegocio.cierre
      ? `Domicilios cerrados por hoy. Recoge hasta las ${estadoNegocio.cierre}.`
      : estadoNegocio.lineaCorta;
  }

  const clases = [
    "intro",
    luzEncendida ? "on auto" : "off",
    lista ? "lista" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={raizRef}
      className={clases}
      role="dialog"
      aria-modal="true"
      aria-label={`Bienvenida a ${negocio.nombre}`}
      style={{ "--espera": `${ESPERA_AUTOMATICA_MS}ms` } as React.CSSProperties}
      onClick={(evento) => {
        // Abierto: tocar la escena también entra al menú
        if (
          luzEncendida &&
          !(evento.target as HTMLElement).closest(".i-panel")
        ) {
          salir();
        }
      }}
    >
      <div className="i-bg">
        <div className="i-rayos" />
        <div className="i-luz" />
      </div>

      <div className="i-top">
        <div className="i-rotulo" ref={rotuloRef}>
          <img
            className="base"
            src={negocio.logoRotulo ?? negocio.logo}
            alt={negocio.nombre}
            width={520}
            height={520}
          />
          <img
            className="lit"
            src={negocio.logoRotulo ?? negocio.logo}
            alt=""
            width={520}
            height={520}
          />
          {DESTELLOS.map(([x, y, lado], indice) => (
            <svg
              key={indice}
              className={`i-est${indice < 2 ? " fijo" : ""}`}
              style={
                {
                  "--x": `${x}%`,
                  "--y": `${y}%`,
                  "--s": `${lado}px`,
                  "--i": indice,
                } as React.CSSProperties
              }
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10 5.2-.6 9.4-4.8 10-10Z" />
            </svg>
          ))}
        </div>
      </div>

      <div className="i-anfi">
        {negocio.anfitriona && (
          <img
            ref={anfitrionaRef}
            src={negocio.anfitriona.cuerpo}
            alt=""
            width={667}
            height={1000}
          />
        )}
      </div>

      <div className="i-velo" />
      <span className="i-spark" ref={chispaRef} />

      <div className="i-panel" ref={panelRef}>
        <h2 className="i-msg" key={titular}>
          <Palabras texto={saludo} desde={0} />
          <br />
          <Palabras texto={titular} desde={saludo.split(" ").length} />
        </h2>

        {cerrado ? (
          <>
            <div className="i-datos">
              {apertura && (
                <div>
                  <Clock3 size={20} aria-hidden="true" />
                  <span>
                    Abrimos {apertura.cuando}
                    <small className="num">
                      en {tiempoRestante(apertura.minutos)}
                    </small>
                  </span>
                  <b className="num">{apertura.hora}</b>
                </div>
              )}
              {estadoNegocio.inicioDomicilios && (
                <div>
                  <Bike size={20} aria-hidden="true" />
                  <span>Domicilios desde</span>
                  <b className="num">{estadoNegocio.inicioDomicilios}</b>
                </div>
              )}
            </div>

            <p className="i-falta">
              Vuelve a esa hora; con gusto te atenderemos.
              <br />
              Esta pantalla se abre sola cuando abramos.
            </p>

            {horariosVisibles && (
              <div className="i-hor">
                <FilasHorario resumenHorarios={resumenHorarios} />
              </div>
            )}

            <button
              type="button"
              className="i-sec"
              aria-expanded={horariosVisibles}
              onClick={() => setHorariosVisibles((visibles) => !visibles)}
            >
              {horariosVisibles ? "Ocultar horarios" : "Ver todos los horarios"}
            </button>
          </>
        ) : (
          <>
            <p className="i-sub">
              {estadoNegocio.estado === "domicilios_cerrados" ? (
                <Store size={20} aria-hidden="true" />
              ) : (
                <Bike size={20} aria-hidden="true" />
              )}
              {detalleAbierto}
            </p>

            <button type="button" className="cta" onClick={salir}>
              <span>Ver el menú</span>
              <ArrowRight size={22} aria-hidden="true" />
            </button>
          </>
        )}

        <FirmaQuickFlow />
      </div>
    </div>
  );
}
