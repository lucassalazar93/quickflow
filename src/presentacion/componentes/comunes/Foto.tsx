type Props = {
  src: string;
  // Las fotos de platos traen el nombre incrustado y se recortan hacia la comida;
  // las de bebidas se muestran completas.
  completa?: boolean;
  className?: string;
  prioritaria?: boolean;
};

export function Foto({ src, completa, className, prioritaria }: Props) {
  const clases = ["ph", completa ? "bebida" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={clases}>
      <img
        src={src}
        alt=""
        width={600}
        height={600}
        decoding="async"
        loading={prioritaria ? "eager" : "lazy"}
      />
    </span>
  );
}
