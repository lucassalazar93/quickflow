"use client";

import { useEffect, useRef } from "react";
import styles from "./ModalCarrito.module.css";

// Declarar el tipo global de google.maps sin referencia circular
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: any;
        };
      };
    };
  }
}

interface InputDireccionAutocompleteProps {
  value: string;
  onChangeDireccion: (value: string) => void;
  onSeleccionarDireccion: ({
    direccionCompleta,
    latitud,
    longitud,
  }: {
    direccionCompleta: string;
    latitud?: number;
    longitud?: number;
  }) => void;
  placeholder?: string;
  prefijoInicial?: string;
}

export function InputDireccionAutocomplete({
  value,
  onChangeDireccion,
  onSeleccionarDireccion,
  placeholder = "Calle 79 # 43-04",
  prefijoInicial,
}: InputDireccionAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const listenerRef = useRef<any>(null);
  const scriptLoadingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const inicializar = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey || !inputRef.current) return;

      try {
        if (!window.google?.maps?.places && !scriptLoadingRef.current) {
          scriptLoadingRef.current = true;
          await cargarGoogleMaps(apiKey);
          scriptLoadingRef.current = false;
        } else if (!window.google?.maps?.places && scriptLoadingRef.current) {
          await esperarGoogleMaps();
        }

        if (
          cancelled ||
          !inputRef.current ||
          !window.google?.maps?.places ||
          autocompleteRef.current
        ) {
          return;
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["address"],
            componentRestrictions: { country: "co" },
            fields: ["formatted_address", "geometry"],
          },
        );

        listenerRef.current = autocompleteRef.current.addListener(
          "place_changed",
          () => {
            const place = autocompleteRef.current?.getPlace();
            if (!place) return;

            const direccionCompleta =
              place.formatted_address ?? inputRef.current?.value ?? "";

            const latitud = place.geometry?.location?.lat();
            const longitud = place.geometry?.location?.lng();

            onChangeDireccion(direccionCompleta);

            onSeleccionarDireccion({
              direccionCompleta,
              latitud,
              longitud,
            });
          },
        );
      } catch (error) {
        console.error("No se pudo inicializar Google Places:", error);
      }
    };

    inicializar();

    return () => {
      cancelled = true;

      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
    };
  }, [onChangeDireccion, onSeleccionarDireccion]);

  const handleFocus = () => {
    if (prefijoInicial && !value.trim()) {
      onChangeDireccion(prefijoInicial);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeDireccion(event.target.value);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      className={styles.input}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}

async function cargarGoogleMaps(apiKey: string) {
  const scriptId = "google-maps-script";

  const existente = document.getElementById(scriptId);
  if (existente) {
    await esperarGoogleMaps();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });

  await esperarGoogleMaps();
}

async function esperarGoogleMaps() {
  await new Promise<void>((resolve, reject) => {
    let intentos = 0;

    const interval = window.setInterval(() => {
      intentos += 1;

      if (window.google?.maps?.places) {
        window.clearInterval(interval);
        resolve();
        return;
      }

      if (intentos > 100) {
        window.clearInterval(interval);
        reject(new Error("Google Maps no estuvo disponible a tiempo"));
      }
    }, 100);
  });
}
