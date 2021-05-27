import { Request } from "express";
import { ContextHolder } from "../../0-base/context-holder";
import { logs } from "../../0-base/logs-context";
import { APIContext } from "./api-context";
import { APISecurity } from "./api-security";
import { Scopes, Securities } from "./securities";

/**
 * 各 Route に到達する前に呼ばれます
 * Authentication middleware for tsoa @Security
 */
export async function expressAuthentication(
  req: Request,
  security: Securities,
  scopes: Scopes[] = []
) {
  start(req);

  switch (security) {
    case Securities.NONE:
      return;

    case Securities.API:
      return await APISecurity.verify(req, scopes);

    default:
      throw new Error(`Unknown security: ${security}`);
  }
}

/**
 * 共通コンテキストの分析とロギング
 * @param req
 */
function start(req: Request) {
  const api = ContextHolder.set(new APIContext(req));

  logs().info(`[API 🔶] ${req.method.toUpperCase()} ${req.path}`, undefined, {
    method: api.requestInfo.method || "",
    path: api.requestInfo.path || "",
  });
}
