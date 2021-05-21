import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import SwaggerUI from "swagger-ui-express";
import { ContextHolder } from "../0-base/context-holder";
import { LogsFactory } from "../4-infrastructure/logs/logs-factory";
import { initializeTypeORM } from "../4-infrastructure/transaction/initialize-typeorm";
import { APIMiddlewares } from "./helpers/express-middlewares";
import swaggerJson from "./tsoa-generated/swagger.json";
import { TransactionFactory } from "../4-infrastructure/transaction/transaction-factory";
import { RegisterRoutes } from "./tsoa-generated/express-routes";

const app = express();

app.use(cors({ allowedHeaders: ["x-tenant-id", "content-type"] }));
app.use(APIMiddlewares.requestLogger);
app.use(APIMiddlewares.responseBodyFixer);

app.use(
  "/api-docs/v1",
  SwaggerUI.serve,
  SwaggerUI.setup(swaggerJson, {
    swaggerOptions: { tagsSorter: "alpha" },
  })
);

const router = express.Router();
router.use(async (req: Request, res: Response, next: NextFunction) => {
  await initializeTypeORM();
  ContextHolder.startSession();
  ContextHolder.set(TransactionFactory.typeORMContext());
  ContextHolder.set(LogsFactory.createContext());
  next();
});
RegisterRoutes(router);
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  ContextHolder.endSession();
  next(error);
});
router.use((req: Request, res: Response, next: NextFunction) => {
  ContextHolder.endSession();
  next();
});
app.use("/api/v1", router);

app.use(APIMiddlewares.responseLogger);
app.use(APIMiddlewares.errorHandler);

export const ExpressApp = app;
