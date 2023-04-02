import jwtDecode from "jwt-decode";
import { BehaviorSubject, Observable, of } from "rxjs";

interface JWT {
  accessToken: string;
  refreshToken: string;
}

interface ParsedJWT {
  sub: string;
  username: string;
  email: string;
  is_admin: boolean;
  is_verified: boolean;
  exp: number;
}

/** Behavior subject containing JWT token.
 *
 * If JWT token has not been set yet, it returns null.
 */
const JwtToken$ = new BehaviorSubject<JWT | null>(null);

/** Store retrieved JWT token into Local Storage.
 *
 * Stored JWT token can be retrieved using JwtToken behavior subject.
 *
 * @param token JWT token
 */
const storeJwtToken = (token: JWT) => {
  localStorage.setItem("jwt", JSON.stringify(token));
  JwtToken$.next(token);
}

/** Retrieve JWT token from Local Storage.
 *
 * This function does not actually return token. In order
 * to retrieve it, subscribe to JwtToken behavior subject.
 */
const loadJwtToken = () => {
  const storedToken = localStorage.getItem("jwt");
  
  if(storedToken !== null) {
    const parsedToken = JSON.parse(storedToken) as JWT;
    console.log(typeof parsedToken);
    JwtToken$.next(parsedToken);
  } else {
    JwtToken$.next(null);
  }
}

/** Remove JWT token from Local Storage.
 */
const clearJwtToken = () => {
  localStorage.removeItem("jwt");
  JwtToken$.next(null);
}

/** Retrieve behavior subject containing JWT token.
 */
const retrieveJwtToken = (): BehaviorSubject<JWT | null> => JwtToken$;

/** Decode JWT into user object.
 *
 * @param token JWT
 */
const decodeJwt = (token: JWT): ParsedJWT => {
  return jwtDecode<ParsedJWT>(token.accessToken);
}

export type {
  JWT,
  ParsedJWT
};
export {
  storeJwtToken,
  loadJwtToken,
  clearJwtToken,
  retrieveJwtToken,
  decodeJwt
};
