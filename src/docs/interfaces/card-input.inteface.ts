export interface CardInput {
  estudiante: {
    nombre: string;
    dni: string;
    grado: string;
    seccion: string;
    nivel: string;
  };
  anio: string;
  areas: {
    nombre: string;
    competencias: {
      nombre: string;
      notas: {
        I?: string;
        II?: string;
        III?: string;
        IV?: string;
      };
    }[];
  }[];
  conducta?: {
    I?: string;
    II?: string;
    III?: string;
    IV?: string;
    NF?: string;
  };
  comentarios?: string;
  tutora?: string;
}
