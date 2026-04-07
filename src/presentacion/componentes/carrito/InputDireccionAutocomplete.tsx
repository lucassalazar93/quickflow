"use client";

import { useEffect, useMemo, useState } from "react";
import {
  procesarDireccionUsuario,
  type AnalisisDireccion,
} from "@/dominio/domicilios/parseDireccion";
import styles from "./ModalCarrito.module.css";

interface InputDireccionAutocompleteProps {
  id?: string;
  value: string;
  onChangeDireccion: (value: string) => void;
  onSeleccionarDireccion: (direccionFinal: string) => void;
  onAnalisisDireccion?: (analisis: AnalisisDireccion) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function InputDireccionAutocomplete({
  id,
  value,
  onChangeDireccion,
  onSeleccionarDireccion,
  onAnalisisDireccion,
  placeholder = "Calle 79 # 43-04",
  debounceMs = 400,
}: InputDireccionAutocompleteProps) {
  const [analisisDebounced, setAnalisisDebounced] =
    useState<AnalisisDireccion | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const analisis = procesarDireccionUsuario(value);
      setAnalisisDebounced(analisis);
      onAnalisisDireccion?.(analisis);
      setMostrarSugerencias(value.trim().length > 0);
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [debounceMs, onAnalisisDireccion, value]);

  const sugerencias = useMemo(() => {
    if (!analisisDebounced) {
      return [];
    }

    return analisisDebounced.sugerencias;
  }, [analisisDebounced]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeDireccion(event.target.value);
    setMostrarSugerencias(true);
  };

  const seleccionarSugerencia = (sugerencia: string) => {
    onChangeDireccion(sugerencia);
    onSeleccionarDireccion(sugerencia);
    setMostrarSugerencias(false);
  };

  return (
    <div className={styles.autoWrap}>
      <input
        id={id}
        type="text"
        className={styles.input}
        value={value}
        onChange={handleChange}
        onFocus={() => setMostrarSugerencias(true)}
        placeholder={placeholder}
        autoComplete="off"
      />

      {analisisDebounced?.direccionInterpretada && (
        <p className={styles.ayudaDireccion}>
          Dirección interpretada: {analisisDebounced.direccionInterpretada}
        </p>
      )}

      {mostrarSugerencias && sugerencias.length > 0 && (
        <div className={styles.sugerencias}>
          {sugerencias.map((sugerencia) => (
            <button
              key={sugerencia}
              type="button"
              className={styles.sugerenciaItem}
              onClick={() => seleccionarSugerencia(sugerencia)}
            >
              {sugerencia}
            </button>
          ))}
        </div>
      )}

      {analisisDebounced?.requiereConfirmacion && (
        <p className={styles.alertaDireccion}>
          {analisisDebounced.motivoConfirmacion}
        </p>
      )}
    </div>
  );
}
