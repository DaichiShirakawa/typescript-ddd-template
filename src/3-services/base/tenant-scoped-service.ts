import { Tenant } from "../../1-entities/tenant.entity";
import { TenantContext } from "../../2-models/base/tenant-context";
import { BaseService } from "./base-service";
import { ReadonlyTxProcessor, Transaction, TxProcessor } from "./transaction";
import { TransactionContext } from "./transaction-context";

export abstract class TenantScopedService extends BaseService {
  get tenant(): Tenant {
    return TenantContext.instance.tenant;
  }

  get tenantId(): string {
    return TenantContext.instance.id;
  }

  /**
   * Tenant に属するデータのみ読み書きできるよう、拡張された Transaction
   *
   * @see {Transaction}
   */
  protected async startTx<R>(func: TxProcessor<R>): Promise<R> {
    return await TransactionContext.instance.tenantScopedTx(func);
  }

  /**
   * 読み込み専用 Transaction
   */
  protected startReadonlyTx<R>(func: ReadonlyTxProcessor<R>): Promise<R> {
    return TransactionContext.instance.tenantScopedReadonlyTx(func);
  }

  /**
   * テナントに属しないデータへもアクセスできる Transaction
   * @see {Transaction}
   */
  protected startTxDANGER<R>(func: TxProcessor<R>): Promise<R> {
    return super.startTx(func);
  }

  /**
   * テナントに属しないデータへもアクセスできる読み込み専用 Transaction
   */
  protected startReadonlyTxDANGER<R>(
    func: (tx: Transaction) => R | Promise<R>
  ): Promise<R> {
    return super.startReadonlyTx(func);
  }
}
