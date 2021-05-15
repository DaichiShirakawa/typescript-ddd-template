import { Tenant } from "../../1-entities/tenant.entity";
import { TenantContext } from "../../express/context/tenant-context";
import { BaseService } from "./base-service";
import { TxStarter, TxProcessor, Transaction } from "./transaction";

export abstract class BaseTenantService extends BaseService<TenantContext> {
  static START_TX: TxStarter<TenantContext>;
  static START_READONLY_TX: TxStarter<TenantContext>;

  static initialize(
    startTx: TxStarter<TenantContext>,
    startReadonlyTx: TxStarter<TenantContext>
  ) {
    BaseTenantService.START_TX = startTx;
    BaseTenantService.START_READONLY_TX = startReadonlyTx;
  }

  get tenant(): Tenant {
    return this.context.tenant;
  }

  get tenantId(): string {
    return this.context.tenantId;
  }

  /**
   * Tenant に属するデータのみ読み書きできるよう、拡張された Transaction
   * @see {Transaction}
   */
  protected transaction<R>(func: TxProcessor<R>): Promise<R> {
    return BaseTenantService.START_TX(this, func as any);
  }

  /**
   * 読み込み専用 Transaction
   */
  protected findTransaction<R>(
    func: (tx: Transaction) => R | Promise<R>
  ): Promise<R> {
    return BaseTenantService.START_READONLY_TX(this, async (tx) => ({
      returns: () => func(tx as any),
      saveModels: [],
    }));
  }

  /**
   * テナントに属しないデータへもアクセスできる Transaction
   * @see {Transaction}
   */
  protected transactionDANGER<R>(func: TxProcessor<R>): Promise<R> {
    return super.transaction(func);
  }

  /**
   * テナントに属しないデータへもアクセスできる読み込み専用 Transaction
   */
  protected findTransactionDANGER<R>(
    func: (tx: Transaction) => R | Promise<R>
  ): Promise<R> {
    return super.findTransaction(func);
  }
}
