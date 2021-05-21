import { ReadonlyTxProcessor, Transaction, TxProcessor } from "./transaction";
import { TransactionContext } from "./transaction-context";

/**
 * Model を呼び Transaction を扱う Service のベースです
 */
export abstract class BaseService {
  /**
   * 拡張されたトランザクションを返します
   * @see {Transaction}
   */
  protected startTx<R>(func: TxProcessor<R>): Promise<R> {
    return TransactionContext.instance.allTx(func);
  }

  /**
   * 保存処理が発生しない場合にのみ使ってください。
   */
  protected startReadonlyTx<R>(func: ReadonlyTxProcessor<R>): Promise<R> {
    return TransactionContext.instance.allReadonlyTx(func);
  }
}
