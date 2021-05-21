import { Log, Logging } from "@google-cloud/logging";
import { google } from "@google-cloud/logging/build/protos/protos";
import { LogEntry } from "@google-cloud/logging/build/src/entry";
import { BaseContext, ContextHolder } from "../../0-base/context-holder";
import { Env } from "../../0-base/env-def";
import { BaseLogs, Levels } from "../../0-base/logs";
import { logs } from "../../0-base/logs-context";
import { TenantContext } from "../../2-models/base/tenant-context";

export class CloudLoggingLogs extends BaseLogs {
  private log: Log;

  constructor() {
    super();
    const logging = new Logging();
    this.log = logging.log("server");
  }

  protected write(
    level: Levels,
    message: string,
    detail?: any,
    labels: any = {}
  ) {
    const base = ContextHolder.getOrNull(BaseContext);
    const tenant = ContextHolder.getOrNull(TenantContext);

    const metadata: LogEntry = {
      resource: { type: "cloud_function" },
      severity: this.toSeverity(level),
      labels: {
        ...labels,
        env: Env.NODE_ENV,
        execId: base?.execId || "",
        tenantId: tenant?.id || "",
      },
    };
    const entry = this.log.entry(metadata, {
      ...detail,
      message,
    });
    this.log.write(entry).catch((error) => {
      const entry = this.log.entry(
        { resource: { type: "cloud_function" }, severity: "ALERT" },
        { error }
      );
      this.log.write(entry).catch(logs().error);
    });
  }

  private toSeverity(level: Levels): google.logging.type.LogSeverity {
    switch (level) {
      case Levels.TRACE:
        return google.logging.type.LogSeverity.DEFAULT;
      case Levels.DEBUG:
        return google.logging.type.LogSeverity.DEBUG;
      case Levels.INFO:
        return google.logging.type.LogSeverity.INFO;
      case Levels.WARN:
        return google.logging.type.LogSeverity.WARNING;
      case Levels.ERROR:
        return google.logging.type.LogSeverity.ERROR;
      case Levels.FATAL:
        return google.logging.type.LogSeverity.CRITICAL;
      default:
        const _check: never = level;
        return google.logging.type.LogSeverity.DEFAULT;
    }
  }
}
