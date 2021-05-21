import { Request } from "express";
import { Securities, Scopes } from "./securities";
import { APISecurity as APISecurity } from "./api-security";

/**
 * 各 Route に到達する前に呼ばれます
 * Authentication middleware for tsoa @Security
 */
export async function expressAuthentication(
  req: Request,
  security: Securities,
  scopes: Scopes[] = []
) {
  switch (security) {
    case Securities.NONE:
      return;

    case Securities.API:
      return await APISecurity.verify(req, security, scopes);

    default:
      throw new Error(`Unknown security: ${security}`);
  }
}
