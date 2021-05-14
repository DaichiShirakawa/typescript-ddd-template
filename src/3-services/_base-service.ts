import {
  BaseTransaction,
  TxProcessor,
} from "../5-infrastructure/base-transaction";
import { ReadonlyTransaction } from "../5-infrastructure/readonly-transaction";
import { BaseContext, ContextHolder } from "../express/security/base-context";

export abstract class BaseService<C extends BaseContext = BaseContext>
  implements ContextHolder<C>
{
  readonly context: C;

  constructor(ch: ContextHolder<C>) {
    this.context = ch.context;
  }

  /**
   * 拡張されたトランザクションを返します
   * @see {BaseTransaction}
   */
  protected transaction<T>(func: TxProcessor<BaseTransaction, T>): Promise<T> {
    return BaseTransaction.start(this, func);
  }

  /**
   * 保存処理が発生しない場合にのみ使ってください。
   */
  protected findTransaction<T>(func: (tx: BaseTransaction) => Promise<T>) {
    return ReadonlyTransaction.start(this, async (tx) => ({
      returns: () => func(tx),
      saveModels: [],
    }));
  }
}
