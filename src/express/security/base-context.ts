import { HttpsError } from "../https-error";

export abstract class BaseContext<C extends { source?: BaseContext } = {}> {
  protected context: Partial<C>;

  protected constructor(context: Partial<C>) {
    this.context = context;
  }

  public get hasSource() {
    return this.context.source != null;
  }

  public get source(): BaseContext {
    if (!this.hasSource) throw new HttpsError("internal", `No source context`);
    return this.context.source!;
  }
}

export interface ContextHolder<C extends BaseContext = BaseContext> {
  context: C;
}
