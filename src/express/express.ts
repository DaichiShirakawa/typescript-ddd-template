import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import SwaggerUI from "swagger-ui-express";
import { ContextHolder } from "../0-base/context-holder";
import { LogsFactory } from "../4-infrastructure/logs/logs-factory";
import { initializeTypeORM } from "../4-infrastructure/transaction/initialize-typeorm";
import { TransactionFactory } from "../4-infrastructure/transaction/transaction-factory";
import { APIMiddlewares } from "./helpers/express-middlewares";
import { RegisterRoutes } from "./tsoa-generated/express-routes";
import swaggerJson from "./tsoa-generated/swagger.json";

const app = express();

app.use(async (req: Request, res: Response, next: NextFunction) => {
  await initializeTypeORM();
  ContextHolder.startSession();
  ContextHolder.set(TransactionFactory.typeORMContext());
  ContextHolder.set(LogsFactory.createContext());
  next();
});
app.use(cors({ allowedHeaders: ["x-tenant-id", "content-type"] }));
app.use(APIMiddlewares.requestLogger);
app.use(APIMiddlewares.responseBodyFixer);

app.use(
  "/docs/v1",
  SwaggerUI.serve,
  SwaggerUI.setup(swaggerJson, {
    swaggerOptions: { tagsSorter: "alpha" },
  })
);

const router = express.Router();
RegisterRoutes(router);
app.use("/v1", router);

app.use(APIMiddlewares.responseLogger);
app.use(APIMiddlewares.errorHandler);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  ContextHolder.endSession();
  next(error);
});
app.use((req: Request, res: Response, next: NextFunction) => {
  ContextHolder.endSession();
  next();
});

export const ExpressApp = app;
