import { NextFunction, Request, Response } from "express";
import { ValidateError } from "tsoa";
import { ContextHolder } from "../../0-base/context-holder";
import { HttpsError } from "../../0-base/https-error";
import { logs } from "../../0-base/logs-context";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { EntityHelper } from "../../1-entities/base/entity-helper";
import { APIContext } from "../../4-presentation/base/api-context";

export class APIMiddlewares {
  static requestLogger(req: Request, res: Response, next: NextFunction) {
    // この時点ではまだ path 等が詰まっていないため、 api-authenticator の中で出力する
    next();
  }

  static responseBodyFixer(req: Request, res: Response, next: NextFunction) {
    const oldJson = res.json.bind(res);
    res.json = function (body?: any) {
      body = APIMiddlewares.convertFrontEntityRecursively(body);
      oldJson(body);
      return res;
    };
    next();
  }

  static convertFrontEntityRecursively(data: any): any {
    if (data == null) {
      return data;
    } else if (data instanceof MyBaseEntity) {
      return EntityHelper.pickColumns(data);
    } else if (data.constructor === [].constructor) {
      return data.map(APIMiddlewares.convertFrontEntityRecursively);
    } else if (data.constructor === {}.constructor) {
      for (const key in data) {
        data[key] = APIMiddlewares.convertFrontEntityRecursively(data[key]);
      }
      return data;
    } else {
      return data;
    }
  }

  static responseLogger(req: Request, res: Response, next: NextFunction) {
    if (req.route?.path == "/*") {
      next(new HttpsError("not-found", `Invalid Resource Path`));
      return;
    }

    const api = ContextHolder.getOrNull(APIContext);
    logs().info(
      `[API 🔵] ${req.method.toUpperCase()} ${req.path} SUCCEED`,
      [req.res?.statusCode, req.res?.statusMessage],
      {
        method: api?.requestInfo.method || "",
        path: api?.requestInfo.path || "",
      }
    );

    next();
  }

  static errorHandler(
    err: Error | HttpsError | ValidateError,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let message = "";
    let details: any = undefined;

    if (err.constructor.name === HttpsError.name) {
      const httpsError = err as HttpsError;

      message = `[API ❌] ${req.method.toUpperCase()} ${
        req.path
      } FAILED(HttpsError)`;
      details = [httpsError.code, httpsError.message, httpsError.details];

      res.status(httpsError.httpErrorCode.status).send({
        status: httpsError.httpErrorCode.canonicalName,
        msg: httpsError.message,
      });
    } else if (err.constructor.name === ValidateError.name) {
      const ve: ValidateError = err as any;
      message = `[API ❌] ${req.method.toUpperCase()} ${
        req.path
      } FAILED(ValidateError)`;
      details = ve;
      res.status(ve.status).json(ve);
    } else {
      message = `[API ❌] ${req.method.toUpperCase()} ${
        req.path
      } FAILED(UnexpectedError, ${err?.constructor || typeof err})`;
      details = err;
      res.status(500).send({ status: "INTERNAL_SERVER_ERROR" });
    }

    const api = ContextHolder.getOrNull(APIContext);
    logs().error(message, details, {
      method: api?.requestInfo.method || "",
      path: api?.requestInfo.path || "",
    });

    next(err);
  }
}
