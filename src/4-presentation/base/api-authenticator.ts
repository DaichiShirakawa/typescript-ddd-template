import { Request } from "express";
import { ContextHolder } from "../../0-base/context-holder";
import { logs } from "../../0-base/logs-context";
import { APIContext } from "./api-context";
import { Scopes, Securities } from "./securities";
import { APISecurity } from "./api-security";

/**
 * 各 Route に到達する前に呼ばれます
 * Authentication middleware for tsoa @Security
 */
export async function expressAuthentication(
  req: Request,
  security: Securities,
  scopes: Scopes[] = []
) {
  const api = ContextHolder.set(new APIContext(req));

  logs().info(`[API 🔶] ${req.method.toUpperCase()} ${req.path}`, undefined, {
    method: api.requestInfo.method || "",
    path: api.requestInfo.path || "",
  });

  switch (security) {
    case Securities.NONE:
      return;

    case Securities.API:
      return await APISecurity.verify(req, scopes);

    default:
      throw new Error(`Unknown security: ${security}`);
  }
}
