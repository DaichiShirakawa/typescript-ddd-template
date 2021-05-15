import DotEnv from "dotenv-flow";

/**
 * jestでの実行時、なぜか.env*.localが読まれないので注意。
 */
const r = DotEnv.config({ path: "./.env", silent: true });

export const Env: {
  NODE_ENV: string;
} = process.env as any;

console.log(`[DotEnv] read`);
