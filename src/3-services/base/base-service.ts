import { Context, ContextHolder } from "../../0-definitions/context";
import { DUMMY_TX_STARTERS } from "./dummy-tx";
import {
  ReadonlyTxProcessor,
  Transaction,
  TxProcessor,
  TxStarters,
} from "./transaction";

/**
 * Model を呼び Transaction を扱う Service のベースです
 */
export abstract class BaseService<C extends Context = Context>
  implements ContextHolder<C>
{
  static TX_STARTERS: TxStarters<any> = DUMMY_TX_STARTERS;

  readonly context: C;

  constructor(ch: ContextHolder<C>) {
    this.context = ch.context;
  }

  /**
   * 拡張されたトランザクションを返します
   * @see {Transaction}
   */
  protected startTx<R>(func: TxProcessor<R>): Promise<R> {
    return BaseService.TX_STARTERS.tx(this, func);
  }

  /**
   * 保存処理が発生しない場合にのみ使ってください。
   */
  protected startReadonlyTx<R>(func: ReadonlyTxProcessor<R>): Promise<R> {
    return BaseService.TX_STARTERS.readonlyTx(this, func);
  }
}
