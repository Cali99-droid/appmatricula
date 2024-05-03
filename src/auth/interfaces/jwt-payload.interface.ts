export interface JwtPayload {
  email: string;
  sub: number;
  /** aaui se agrega todo lo que se quiera grabar en el token*/
}
