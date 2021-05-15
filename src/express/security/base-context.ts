import { HttpsError } from "../https-error";

export abstract class Context<C extends { source?: Context } = {}> {
  protected context: Partial<C>;

  protected constructor(context: Partial<C>) {
    this.context = context;
  }

  public get hasSource() {
    return this.context.source != null;
  }

  public get source(): Context {
    if (!this.hasSource) throw new HttpsError("internal", `No source context`);
    return this.context.source!;
  }
}

export interface ContextHolder<C extends Context = Context> {
  context: C;
}
