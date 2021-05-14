import cors from "cors";
import express from "express";
import SwaggerUI from "swagger-ui-express";
import { SWAGGER_OPTIONS } from "./swagger-options";
import { APIMiddlewares } from "./api-middlewares";
import { RegisterRoutes } from "./tsoa-generated/api-routes";
import swaggerJson from "./tsoa-generated/swagger.json";

const app = express();
const router = express.Router();

app.use(cors({ allowedHeaders: ["x-tenant-id", "content-type"] }));
app.use(APIMiddlewares.requestLogger);

app.use(
  "/api-docs/v1",
  SwaggerUI.serve,
  SwaggerUI.setup(swaggerJson, SWAGGER_OPTIONS)
);
RegisterRoutes(router);
app.use("/api/v1", router);

app.use(APIMiddlewares.responseLogger);
app.use(APIMiddlewares.errorHandler);

export const ExpressApp = app;
