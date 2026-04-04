export type ReglaDomicilio = {
  zona: string;
  calleDesde: number;
  calleHasta: number;
  carreraDesde: number;
  carreraHasta: number;
  valor: number;
};

export const REGLAS_DOMICILIO: ReglaDomicilio[] = [
  {
    zona: "Zona 1",
    calleDesde: 78,
    calleHasta: 82,
    carreraDesde: 33,
    carreraHasta: 41,
    valor: 3000,
  },
  {
    zona: "Zona 2",
    calleDesde: 78,
    calleHasta: 82,
    carreraDesde: 28,
    carreraHasta: 32,
    valor: 4000,
  },
  {
    zona: "Zona 3",
    calleDesde: 85,
    calleHasta: 89,
    carreraDesde: 32,
    carreraHasta: 37,
    valor: 5000,
  },
  {
    zona: "Zona 4",
    calleDesde: 66,
    calleHasta: 71,
    carreraDesde: 28,
    carreraHasta: 39,
    valor: 5000,
  },
  {
    zona: "Zona 5",
    calleDesde: 79,
    calleHasta: 82,
    carreraDesde: 42,
    carreraHasta: 50,
    valor: 6000,
  },
  {
    zona: "Zona 6",
    calleDesde: 65,
    calleHasta: 70,
    carreraDesde: 43,
    carreraHasta: 47,
    valor: 7000,
  },
];
