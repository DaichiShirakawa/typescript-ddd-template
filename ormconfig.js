const fs = require("fs");
require("dotenv-flow").config({ path: "./.env", silent: true });

/**
 * こちらは CLI から実行時のみ読まれる想定。
 * サーバーでの実行パラメータは変更があるため、 initialize-typeorm.ts 参照
 */

const runOnLocal = process.env.RUN_ON_LOCAL == "true";

module.exports = {
  type: process.env.DB_TYPE,
  host: runOnLocal ? process.env.DB_HOST : undefined,
  port: runOnLocal ? Number(process.env.DB_PORT) : undefined,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: ["src/**/*.entity.ts"],
  migrations: ["typeorm/migrations/**/*.ts"],
  subscribers: ["typeorm/subscribers/**/*.ts"],
  cli: {
    entitiesDir: "src/**/*.entity.ts",
    migrationsDir: "typeorm/migrations/",
    subscribersDir: "typeorm/subscribers/",
  },
  extra: {
    // use socket path
    socketPath: runOnLocal
      ? undefined
      : `/cloudsql/${process.env.DB_CLOUDSQL_CONNECTION_NAME}`,
    ssl: runOnLocal
      ? {
          cert: fs.readFileSync(
            __dirname + "/.env/database-keys/client-cert.pem"
          ),
          key: fs.readFileSync(
            __dirname + "/.env/database-keys/client-key.pem"
          ),
          ca: fs.readFileSync(__dirname + "/.env/database-keys/server-ca.pem"),
        }
      : undefined,
  },
};
