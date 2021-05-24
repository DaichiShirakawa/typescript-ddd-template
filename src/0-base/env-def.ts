import DotEnv from "dotenv-flow";

/**
 * jestでの実行時、なぜか.env*.localが読まれないので注意。
 */
const r = DotEnv.config({ path: "./.env", silent: true });

export const Env: {
  NODE_ENV: string;
  RUN_ON_LOCAL: string;

  GOOGLE_APPLICATION_CREDENTIALS: string;
  DB_CLOUDSQL_CONNECTION_NAME: string;
  DB_TYPE: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
} = process.env as any;

console.info(`[DotEnv] read`);
