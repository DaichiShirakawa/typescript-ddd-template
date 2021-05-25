import { withContext } from "./0-base/context";
import "./0-base/env-def";
import { ExpressApp } from "./express/express";
import { LogsFactory } from "./4-infrastructure/logs/logs-factory";

try {
  require("@google-cloud/trace-agent").start();
} catch (e) {
  console.log(`Failed to start @google-cloud/trace-agent`);
}

export const api = async (req: any, res: any) => {
  return await withContext([LogsFactory.createContext()], () =>
    ExpressApp(req, res)
  );
};
