import { Request } from "express";
import { Securities, Scopes } from "./securities";
import { ConsoleSecurity } from "./console-security";

/**
 * Authentication middleware for tsoa @Security
 */
export async function expressAuthentication(
  req: Request,
  security: Securities,
  scopes: Scopes[] = []
) {
  switch (security) {
    case Securities.CONSOLE:
      return await ConsoleSecurity.verify(req, security, scopes);

    case Securities.MOBILE:
      throw new Error(`Securities.APP not implemented`);

    default:
      throw new Error(`Unknown security: ${security}`);
  }
}
