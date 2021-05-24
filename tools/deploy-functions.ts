import { execSync } from "child_process";
import { toolsEnvLoad } from "./tools-env-loader";

/**
 * .env/.env.{stage}-deploy.local を Functions 環境変数へ変換してデプロイします
 * .env/* はデプロイ内容に含まれません
 */

const env = toolsEnvLoad(".env.{stage}-deploy.local");

if (!env.GCP_PROJECT_NAME) {
  throw new Error(`GCP_PROJECT_NAME required`);
}

const deployEnvs: string[] = [];

for (const [key, value] of Object.entries(env)) {
  if (!value) continue;
  deployEnvs.push(`${key}=${value}`);
}

const command = [
  `gcloud functions deploy api`,
  `--set-env-vars ${deployEnvs.join(",")}`,
  `--region ${env.GCP_REGION}`,
  `--runtime nodejs14`,
  `--trigger-http`,
  `--security-level=secure-always`,
  `--timeout=100s`,
  `--memory=256MB`,
].join(" \\\n");

execSync(
  [
    `set -x;`,
    `gcloud config set project ${env.GCP_PROJECT_NAME};`,
    `${command};`,
  ].join(" "),
  { stdio: "inherit" }
);
