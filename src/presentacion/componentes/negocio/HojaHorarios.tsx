import { Bike, Clock3, Store, X } from "lucide-react";
import type {
  ResultadoEstadoNegocio,
  ResumenHorariosVisible,
} from "@/dominio/horarios/obtenerEstadoNegocio";
import { Hoja } from "@/presentacion/componentes/comunes/Hoja";

// "Lunes a jueves: 6:00 PM - 12:00 AM" -> ["Lunes a jueves", "6:00 PM - 12:00 AM"]
function separar(linea: string): [string, string] {
  const corte = linea.indexOf(": ");

  return corte === -1
    ? [linea, ""]
    : [linea.slice(0, corte), linea.slice(corte + 2)];
}

// Una tarjeta por grupo de días, con tienda y domicilios por separado
export function FilasHorario({
  resumenHorarios,
}: {
  resumenHorarios: ResumenHorariosVisible;
}) {
  return (
    <>
      {resumenHorarios.lineas.map((linea, indice) => {
        const [dias, tienda] = separar(linea);
        const [, domicilios] = separar(
          resumenHorarios.lineasDomicilios[indice] ?? "",
        );

        return (
          <div key={dias} className="hr">
            <h3>{dias}</h3>
            <p>
              <Store size={18} aria-hidden="true" /> Tienda
              <span className="num">{tienda}</span>
            </p>
            {domicilios && (
              <p>
                <Bike size={18} aria-hidden="true" /> Domicilios
                <span className="num">{domicilios}</span>
              </p>
            )}
          </div>
        );
      })}
    </>
  );
}

type Props = {
  abierta: boolean;
  onCerrar: () => void;
  estadoNegocio: ResultadoEstadoNegocio;
  resumenHorarios: ResumenHorariosVisible;
};

export function HojaHorarios({
  abierta,
  onCerrar,
  estadoNegocio,
  resumenHorarios,
}: Props) {
  const cerrado = estadoNegocio.estado === "cerrado";

  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} etiqueta="Horarios">
      <div className="c-tit">
        <h2>Horarios</h2>
        <button
          type="button"
          className="rnd"
          onClick={onCerrar}
          aria-label="Cerrar"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="cuerpo">
        <div className={`h-est${cerrado ? " cer" : ""}`}>
          <Clock3 size={22} aria-hidden="true" />
          <span>
            {cerrado
              ? estadoNegocio.lineaCorta
              : `Abierto ahora${estadoNegocio.cierre ? ` hasta las ${estadoNegocio.cierre}` : ""} · ${estadoNegocio.lineaCorta}`}
          </span>
        </div>

        <FilasHorario resumenHorarios={resumenHorarios} />

        <p className="h-nota">Hora de Colombia.</p>
      </div>
    </Hoja>
  );
}
