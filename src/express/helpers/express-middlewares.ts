import { NextFunction, Request, Response } from "express";
import { ValidateError } from "tsoa";
import { HttpsError } from "../../0-base/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { EntityHelper } from "../../1-entities/base/entity-helper";
import { logs } from "../../0-base/logs-context";

export class APIMiddlewares {
  static requestLogger(req: Request, res: Response, next: NextFunction) {
    logs().info(`[API 🔶] ${req.method.toUpperCase()} ${req.path}`);
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

    logs().info(`[API 🔵] ${req.method.toUpperCase()} ${req.path} SUCCEED`, [
      res.statusCode,
      res.statusMessage,
    ]);
    next();
  }

  static errorHandler(
    err: Error | HttpsError | ValidateError,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (err.constructor.name === HttpsError.name) {
      const httpsError = err as HttpsError;
      logs().error(
        `[API ❌] ${req.method.toUpperCase()} ${req.path} FAILED(HttpsError)`,
        [httpsError.code, httpsError.message, httpsError.details]
      );
      res.status(httpsError.httpErrorCode.status).send({
        status: httpsError.httpErrorCode.canonicalName,
        msg: httpsError.message,
      });
      return;
    }

    if (err.constructor.name === ValidateError.name) {
      const ve: ValidateError = err as any;
      logs().error(
        `[API ❌] ${req.method.toUpperCase()} ${
          req.path
        } FAILED(ValidateError)`,
        ve
      );
      res.status(ve.status).json(ve);
      return;
    }

    logs().error(
      `[API ❌] ${req.method.toUpperCase()} ${
        req.path
      } FAILED(UnexpectedError, ${err?.constructor || typeof err})`,
      err
    );
    res.status(500).send({ status: "INTERNAL_SERVER_ERROR" });
    return;
  }
}
