import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import SwaggerUI from "swagger-ui-express";
import { APIMiddlewares } from "./4-controllers/helpers/express-middlewares";
import { RegisterRoutes } from "./4-controllers/tsoa-generated/routes";
import swaggerJson from "./4-controllers/tsoa-generated/swagger.json";
import { initializeTransaction } from "./5-infrastructure/helpers/initialize-transaction";
import { initializeTypeORM } from "./5-infrastructure/helpers/initialize-typeorm";

const app = express();

app.use(cors({ allowedHeaders: ["x-tenant-id", "content-type"] }));
app.use(APIMiddlewares.requestLogger);

app.use(
  "/api-docs/v1",
  SwaggerUI.serve,
  SwaggerUI.setup(swaggerJson, {
    swaggerOptions: { tagsSorter: "alpha" },
  })
);

const router = express.Router();
RegisterRoutes(router);
router.use(async (req: Request, res: Response, next: NextFunction) => {
  await initializeTypeORM();
  initializeTransaction();
  next();
});
app.use("/api/v1", router);

app.use(APIMiddlewares.responseLogger);
app.use(APIMiddlewares.errorHandler);

export const ExpressApp = app;
