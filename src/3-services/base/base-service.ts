import { Context, ContextHolder } from "../../express/context/base-context";
import { Transaction, TxProcessor, TxStarter } from "./transaction";

/**
 * Model を呼び Transaction を扱う Service のベースです
 */
export abstract class BaseService<C extends Context = Context>
  implements ContextHolder<C>
{
  static START_TX: TxStarter<any>;
  static START_READONLY_TX: TxStarter<any>;

  static initialize(startTx: TxStarter, startReadonlyTx: TxStarter) {
    BaseService.START_TX = startTx;
    BaseService.START_READONLY_TX = startReadonlyTx;
  }

  readonly context: C;

  constructor(ch: ContextHolder<C>) {
    this.context = ch.context;
  }

  /**
   * 拡張されたトランザクションを返します
   * @see {Transaction}
   */
  protected transaction<R>(func: TxProcessor<R>): Promise<R> {
    return BaseService.START_TX(this, func as any);
  }

  /**
   * 保存処理が発生しない場合にのみ使ってください。
   */
  protected findTransaction<R>(
    func: (tx: Transaction) => R | Promise<R>
  ): Promise<R> {
    return BaseService.START_READONLY_TX(this, async (tx) => ({
      returns: () => func(tx as any),
      saveModels: [],
    }));
  }
}
