import { Context } from "../../0-base/context";
import { ContextHolder } from "../../0-base/context-holder";

export class SuperContext extends Context {
  constructor(readonly superUserId: string) {
    super();
  }

  static get instance() {
    return ContextHolder.get(SuperContext);
  }
}
