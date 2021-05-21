import Log4js from "log4js";
import { Env } from "./env-def";

export enum Levels {
  TRACE = "TRACE",
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

export class BaseLogs {
  private readonly logger: Log4js.Logger;

  constructor() {
    this.logger = Log4js.getLogger(Env.NODE_ENV);
  }

  trace(message: string, detail?: any) {
    if (detail) this.logger.trace(message, detail);
    else this.logger.trace(message);
    this.write(Levels.TRACE, message, detail);
  }

  debug(message: string, detail?: any) {
    if (detail) this.logger.debug(message, detail);
    else this.logger.debug(message);
    this.write(Levels.DEBUG, message, detail);
  }

  info(message: string, detail?: any) {
    if (detail) this.logger.info(message, detail);
    else this.logger.info(message);
    this.write(Levels.INFO, message, detail);
  }

  warn(message: string, detail?: any) {
    if (detail) this.logger.warn(message, detail);
    else this.logger.warn(message);
    this.write(Levels.WARN, message, detail);
  }

  error(message: string, detail?: any) {
    if (detail) this.logger.error(message, detail);
    else this.logger.error(message);
    this.write(Levels.ERROR, message, detail);
  }

  fatal(message: string, detail?: any) {
    this.logger.fatal(message, detail);
    this.write(Levels.FATAL, message, detail);
  }

  write(level: Levels, message: string, detail?: any) {
    // Override if need something to do
  }
}

const config: Log4js.Configuration = {
  appenders: {
    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%[[%-5.5p]%] - %m",
      },
    },
    testFile: {
      type: "dateFile",
      filename: "logs/test.log",
      pattern: "yyyy-MM-dd",
      alwaysIncludePattern: false,
      keepFileExt: true,
      layout: {
        type: "pattern",
        pattern: "[%d{yyyy-MM-dd hh:mm:ss} %-5.5p] - %m",
      },
    },
    file: {
      type: "dateFile",
      filename: "logs/server.log",
      pattern: "yyyy-MM-dd",
      alwaysIncludePattern: false,
      keepFileExt: true,
      layout: {
        type: "pattern",
        pattern: "[%d{yyyy-MM-dd hh:mm:ss} %-5.5p] - %m",
      },
    },
  },
  categories: {
    default: {
      appenders: ["console", "file"],
      level: "INFO",
      enableCallStack: true,
    },
    test: {
      appenders: ["console", "testFile"],
      level: "ALL",
      enableCallStack: true,
    },
  },
};

Log4js.configure(config);
