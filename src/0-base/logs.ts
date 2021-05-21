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

  trace(message: string, detail?: any, labels: any = {}) {
    if (detail) this.logger.trace(message, detail);
    else this.logger.trace(message);
    this.write(Levels.TRACE, message, detail, labels);
  }

  debug(message: string, detail?: any, labels: any = {}) {
    if (detail) this.logger.debug(message, detail);
    else this.logger.debug(message);
    this.write(Levels.DEBUG, message, detail, labels);
  }

  info(message: string, detail?: any, labels: any = {}) {
    if (detail) this.logger.info(message, detail);
    else this.logger.info(message);
    this.write(Levels.INFO, message, detail, labels);
  }

  warn(message: string, detail?: any, labels: any = {}) {
    if (detail) this.logger.warn(message, detail);
    else this.logger.warn(message);
    this.write(Levels.WARN, message, detail, labels);
  }

  error(message: string, detail?: any, labels: any = {}) {
    if (detail) this.logger.error(message, detail);
    else this.logger.error(message);
    this.write(Levels.ERROR, message, detail, labels);
  }

  fatal(message: string, detail?: any, labels: any = {}) {
    if (detail) this.logger.fatal(message, detail);
    else this.logger.fatal(message);
    this.write(Levels.FATAL, message, detail, labels);
  }

  /**
   *
   * @param level
   * @param message
   * @param detail
   * @param labels Cloud Logging などでラベルを追加したい場合
   */
  protected write(
    level: Levels,
    message: string,
    detail?: any,
    labels: any = {}
  ) {
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
      filename: "log/test.log",
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
      filename: "log/server.log",
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
