import fs from "fs";
import {
  ExtendedRoutesConfig,
  ExtendedSpecConfig,
  generateRoutes,
  generateSpec,
} from "tsoa";

(async () => {
  const outputDirectory = `src/express/tsoa-generated`;
  const routesFileName = `express-routes.ts`;

  const entryFile = `src/functions.index.ts`;
  const controllerPathGlobs = [`src/**/*.api.ts`];
  const authenticationModule = `src/4-presentation/base/api-authenticator.ts`;

  const swaggerOpts: ExtendedSpecConfig = {
    schemes: ["http", "https"],
    host: "localhost:8080",
    basePath: "/api/v1",
    specVersion: 3,
    noImplicitAdditionalProperties: "throw-on-extras",
    entryFile,
    outputDirectory,
    controllerPathGlobs,

    securityDefinitions: {
      TENANT: {
        type: "apiKey",
        name: "x-tenant-id",
        in: "header",
        description:
          "とりあえずテナントIDをつっこむ。本格的なセキュリティはこんど考える",
      },
    },
  };

  const routeOpts: ExtendedRoutesConfig = {
    basePath: "/",
    entryFile: entryFile,
    routesDir: outputDirectory,
    routesFileName: routesFileName,
    noImplicitAdditionalProperties: "throw-on-extras",
    controllerPathGlobs,
    authenticationModule,
  };

  const ignores: string[] = [
    // "**/node_modules/**" // 入れると Pick 等も使えなくなる
  ];

  await Promise.all([
    generateSpec(swaggerOpts, undefined, ignores).then(() =>
      console.log("Swagger Refreshed!")
    ),
    generateRoutes(routeOpts, undefined, ignores).then(() =>
      console.log("Routes Refreshed!")
    ),
  ]);

  // @ts-nocheck を先頭に追加
  // "next()" を promiseHandler(); の最後に挿入

  const routesPath = `${outputDirectory}/${routesFileName}`;

  let content = fs.readFileSync(routesPath).toString();
  const target = "returnHandler(response, statusCode, data, headers)";
  const index = content.indexOf(target) + target.length;
  content = `${content.slice(0, index)};next();\n${content.slice(index)}`;

  fs.writeFileSync(routesPath, "// @ts-nocheck\n/* cSpell: disable */\n");
  fs.appendFileSync(routesPath, content);
})();
