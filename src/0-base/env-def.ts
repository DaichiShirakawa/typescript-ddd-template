import DotEnv from "dotenv-flow";
import { logs } from "./logs-context";

/**
 * jestでの実行時、なぜか.env*.localが読まれないので注意。
 */
const r = DotEnv.config({ path: "./.env", silent: true });

export const Env: {
  NODE_ENV: string;
  GOOGLE_APPLICATION_CREDENTIALS: string;
} = process.env as any;

logs().info(`[DotEnv] read`);
