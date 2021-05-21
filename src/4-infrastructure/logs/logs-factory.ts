import { Env } from "../../0-base/env-def";
import { BaseLogs } from "../../0-base/logs";
import { LogsContext, logs } from "../../0-base/logs-context";
import { CloudLoggingLogs } from "./cloud-logging-logs";

export class LogsFactory {
  static createContext() {
    let logsClass = BaseLogs;

    if (Env.GOOGLE_APPLICATION_CREDENTIALS) {
      logsClass = CloudLoggingLogs;
    }

    try {
      return new LogsContext(new logsClass());
    } catch (err) {
      logs().error(
        `Failed to generate ${logsClass.name}, use ${BaseLogs.name}`
      );
      return new LogsContext(new BaseLogs());
    }
  }
}
