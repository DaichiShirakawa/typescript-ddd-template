import { Context } from "../../0-base/context";
import { ContextHolder } from "../../0-base/context-holder";
import { ReadonlyTxProcessor, TxProcessor } from "./transaction";

export type TxStarter = <R>(func: TxProcessor<R>) => Promise<R>;

export type ReadonlyTxStarter = <R>(func: ReadonlyTxProcessor<R>) => Promise<R>;

export class TransactionContext extends Context {
  constructor(
    readonly allTx: TxStarter,
    readonly allReadonlyTx: ReadonlyTxStarter,
    readonly tenantScopedTx: TxStarter,
    readonly tenantScopedReadonlyTx: ReadonlyTxStarter
  ) {
    super();
  }

  static get instance() {
    return ContextHolder.get(TransactionContext);
  }
}
