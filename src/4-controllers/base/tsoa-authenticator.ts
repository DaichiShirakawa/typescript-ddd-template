import { Request } from "express";
import { Securities, Scopes } from "./securities";
import { ConsoleSecurity } from "./console-security";

/**
 * 各 Route に到達する前に呼ばれます
 * Authentication middleware for tsoa @Security
 */
export async function tsoaAuthentication(
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
