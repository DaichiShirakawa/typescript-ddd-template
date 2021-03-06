import { Request } from "express";
import { Context } from "../../0-base/context";
import { ContextHolder } from "../../0-base/context-holder";

/**
 * 1 APIリクエストの中で不変なインスタンス
 */
export class APIContext extends Context {
  constructor(readonly req: Request) {
    super();
  }

  static instance() {
    return ContextHolder.get(APIContext);
  }

  get requestInfo() {
    return {
      executeId: this.req.get("function-execution-id") || "-",
      method: this.req.method,
      path: this.req.route.path,
      rawUrl: this.req.originalUrl,
      pathVariables: this.req.params,
      query: this.req.query as any,
    };
  }
}
