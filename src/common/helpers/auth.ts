export function getToken(authorization: string): string {
  if (authorization === undefined) return '';

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer') return '';

  if (token === 'null' || token === 'undefined' || token === '') return '';

  return token;
}
