import DotEnv from "dotenv-flow";

const stage = process.env.NODE_ENV || "development";

/**
 *
 * @param envFileName {stage} を process.env.NODE_ENV || "development" に置換します
 * 例 .env.{stage}-develop.local
 * @returns
 */
export function toolsEnvLoad(envFileName = `.env.{stage}.local`): any {
  const envFile = `./.env/${envFileName.replace("{stage}", stage)}`;
  const env = DotEnv.load(envFile).parsed || {};

  console.debug(env);
  console.debug(`${envFile} load.`);

  return env;
}
