import jwt_decode from "jwt-decode";
import { BehaviorSubject, Observable, of } from "rxjs";

type JWT = string;

interface ParsedJWT {
  sub: number;
  is_admin: boolean;
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
  localStorage.setItem("jwt", token);
  JwtToken$.next(token);
}

/** Retrieve JWT token from Local Storage.
 *
 * This function does not actually return token. In order
 * to retrieve it, subscribe to JwtToken behavior subject.
 */
const loadJwtToken = () => {
  const token = localStorage.getItem("jwt");
  JwtToken$.next(token);
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
  return jwt_decode<ParsedJWT>(token);
}

export type {
  JWT,
  ParsedJWT
};
export {
  storeJwtToken,
  loadJwtToken,
  clearJwtToken,
  retrieveJwtToken
};
