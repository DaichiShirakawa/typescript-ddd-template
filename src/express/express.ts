import cors from "cors";
import express from "express";
import SwaggerUI from "swagger-ui-express";
import { APIMiddlewares } from "./helpers/express-middlewares";
import { RegisterRoutes } from "./tsoa-generated/api-routes";
import swaggerJson from "./tsoa-generated/swagger.json";

const app = express();

app.use(cors({ allowedHeaders: ["x-tenant-id", "content-type"] }));
app.use(APIMiddlewares.appInitialize);
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
app.use(APIMiddlewares.appFinalize);
app.use(APIMiddlewares.appFinalizeError);

export const ExpressApp = app;
