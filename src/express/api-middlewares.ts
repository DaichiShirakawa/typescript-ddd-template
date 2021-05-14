import { NextFunction, Request, Response } from "express";
import { ValidateError } from "tsoa";
import { HttpsError } from "./https-error";

export class APIMiddlewares {
  static requestLogger(req: Request, res: Response, next: NextFunction) {
    console.info(`[API 🔶] ${req.method.toUpperCase()} ${req.path}`);
    next();
  }

  static responseLogger(req: Request, res: Response, next: NextFunction) {
    if (req.route?.path == "/*") {
      next(new HttpsError("not-found", `Invalid Resource Path`));
      return;
    }

    console.info(
      `[API 🔵] ${req.method.toUpperCase()} ${req.path} SUCCEED`,
      res.statusCode,
      res.statusMessage
    );
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
      console.error(
        `[API ❌] ${req.method.toUpperCase()} ${req.path} FAILED(HttpsError)`,
        httpsError.code,
        httpsError.message,
        httpsError.details
      );
      res.status(httpsError.httpErrorCode.status).send({
        status: httpsError.httpErrorCode.canonicalName,
        msg: httpsError.message,
      });
      return;
    }

    if (err.constructor.name === ValidateError.name) {
      const ve: ValidateError = err as any;
      console.error(
        `[API ❌] ${req.method.toUpperCase()} ${
          req.path
        } FAILED(ValidateError)`,
        ve
      );
      res.status(ve.status).json(ve);
      return;
    }

    console.error(
      `[API ❌] ${req.method.toUpperCase()} ${
        req.path
      } FAILED(UnexpectedError, ${err?.constructor || typeof err})`,
      err
    );
    res.status(500).send({ status: "INTERNAL_SERVER_ERROR" });
    return;
  }
}
