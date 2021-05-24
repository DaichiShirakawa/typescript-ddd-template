import { execSync } from "child_process";
import DotEnv from "dotenv-flow";

/**
 * .env/.env.{stage}-deploy.local を Functions 環境変数へ変換してデプロイします
 * .env/* はデプロイ内容に含まれません
 */

const stage = process.env.NODE_ENV || "development";
const envFile = `./.env/.env.${stage}-deploy.local`;
const readEnv = DotEnv.load(envFile).parsed || {};

console.debug(readEnv);
console.debug(`${envFile} read.`);

if (!readEnv.GCP_PROJECT_NAME) {
  throw new Error(`GCP_PROJECT_NAME env required in ${envFile}`);
}

const deployEnvs: string[] = [];

for (const [key, value] of Object.entries(readEnv)) {
  if (!value) continue;
  deployEnvs.push(`${key}=${value}`);
}

const command = [
  `gcloud functions deploy api`,
  `--set-env-vars ${deployEnvs.join(",")}`,
  `--runtime nodejs14`,
  `--trigger-http`,
  `--security-level=secure-always`,
  `--timeout=100s`,
  `--memory=256MB`,
].join(" \\\n");

execSync(
  [
    `set -x;`,
    `gcloud config set project ${readEnv.GCP_PROJECT_NAME};`,
    `${command};`,
  ].join(" "),
  { stdio: "inherit" }
);
