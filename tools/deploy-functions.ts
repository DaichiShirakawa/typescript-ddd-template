import { execSync } from "child_process";
import { toolsEnvLoad } from "./tools-env-loader";

/**
 * .env/.env.{stage}-deploy.local を Functions 環境変数へ変換してデプロイします
 * .env/* はデプロイ内容に含まれません (@see .gcloudignore)
 *
 * npm run deploy -- functionName
 * の実行を想定し、functionNameに応じたデプロイコマンドを定義します
 */

(() => {
  console.log("args", process.argv);

  const env = toolsEnvLoad(".env.{stage}-deploy.local");
  if (!env.GCP_PROJECT_NAME) {
    throw new Error(`GCP_PROJECT_NAME required`);
  }

  const deployEnvs: string[] = [];
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    deployEnvs.push(`${key}=${value}`);
  }

  const commandArr = newFunction(process.argv[2], env);
  commandArr.push(
    `--set-env-vars ${deployEnvs.join(",")}`,
    `--region ${env.GCP_REGION}`
  );

  execSync(
    [
      `set -x;`,
      `gcloud config set project ${env.GCP_PROJECT_NAME};`,
      `npm run build;`,
      `${commandArr.join(" \\\n")};`,
    ].join(" "),
    { stdio: "inherit" }
  );
})();

function newFunction(functionName: string, env: any) {
  switch (functionName) {
    case "api":
      return [
        `gcloud functions deploy ${functionName}`,
        `--runtime nodejs14`,
        `--trigger-http`,
        `--security-level=secure-always`,
        `--timeout=100s`,
        `--memory=256MB`,
      ];

    default:
      console.error(`Unexpected functionName: "${functionName}"`);
      process.exit(1);
  }
}
