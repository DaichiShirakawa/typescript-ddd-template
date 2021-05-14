import { Request } from "express";
import {
  consoleSecurity,
  consoleTenantSecurity,
} from "./security/console-security";
import { Securities } from "./security/securities";

/**
 * Authentication middleware for tsoa @Security
 */
export async function expressAuthentication(
  req: Request,
  security: Securities,
  scopes: string[] = []
) {
  switch (security) {
    case Securities.CONSOLE:
      return await consoleSecurity(req, security, scopes);

    case Securities.CONSOLE_TENANT:
      return await consoleTenantSecurity(req, security, scopes);

    case Securities.APP:
      throw new Error(`Securities.APP not implemented`);

    default:
      throw new Error(`Unknown security: ${security}`);
  }
}
