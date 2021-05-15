import { Request } from "express";
import { Securities } from "./securities";
import { Context } from "./base-context";

type RequestType = {
  executeId: string;
  method: string;
  rawUrl: string;
  path: string;
  pathVariables: {
    [key: string]: string;
  };
  query: {
    [key: string]: string;
  };
  security: Securities;
  scopes: string[];
};

/**
 * 1 APIリクエストの中で不変なインスタンス
 */
export class APIContext extends Context<APIContext> {
  constructor(req: Request, security: Securities, scopes: string[]) {
    super({
      request: {
        executeId: req.get("function-execution-id") || "-",
        method: req.method,
        path: req.route.path,
        rawUrl: req.route.url,
        pathVariables: req.params,
        query: req.query as any,
        security,
        scopes,
      },
    });
  }

  public get request(): RequestType {
    return this.context.request!;
  }
}
