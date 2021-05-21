import { Context } from "./context";
import { ContextHolder } from "./context-holder";
import { BaseLogs } from "./logs";

export class LogsContext extends Context {
  constructor(readonly logs: BaseLogs) {
    super();
  }

  /**
   * @deprecated use logs();
   */
  static get instance() {
    return (
      ContextHolder.getOrNull(LogsContext) || new LogsContext(new BaseLogs())
    );
  }
}

export function logs(category?: string) {
  return LogsContext.instance.logs;
}
