import { Context, ContextHolder } from "../../0-definitions/context";
import { TypeORMHelper } from "../../5-infrastructure/typeorm/typeorm-helper";
import {
  Transaction,
  TxProcessor,
  TxSet,
  ReadonlyTxProcessor,
} from "./transaction";

/**
 * Model を呼び Transaction を扱う Service のベースです
 */
export abstract class BaseService<C extends Context = Context>
  implements ContextHolder<C>
{
  static TX_SET: TxSet<any>;

  readonly context: C;

  constructor(ch: ContextHolder<C>) {
    this.context = ch.context;
  }

  /**
   * 拡張されたトランザクションを返します
   * @see {Transaction}
   */
  protected startTx<R>(func: TxProcessor<R>): Promise<R> {
    return TypeORMHelper.startTx(BaseService.TX_SET, this, func);
  }

  /**
   * 保存処理が発生しない場合にのみ使ってください。
   */
  protected startReadonlyTx<R>(func: ReadonlyTxProcessor<R>): Promise<R> {
    return TypeORMHelper.startReadonlyTx(BaseService.TX_SET, this, func);
  }
}
