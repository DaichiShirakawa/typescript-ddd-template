import { Tenant } from "../../1-entities/tenant.entity";
import { TenantContext } from "../../2-models/base/tenant-context";
import { BaseService } from "./base-service";
import { TypeORMHelper } from "../../5-infrastructure/typeorm/typeorm-helper";
import {
  Transaction,
  TxProcessor,
  TxSet,
  ReadonlyTxProcessor,
} from "./transaction";

export abstract class BaseTenantService extends BaseService<TenantContext> {
  static TX_SET: TxSet<TenantContext>;

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
  protected startTx<R>(func: TxProcessor<R>): Promise<R> {
    return TypeORMHelper.startTx(BaseTenantService.TX_SET, this, func);
  }

  /**
   * 読み込み専用 Transaction
   */
  protected startReadonlyTx<R>(func: ReadonlyTxProcessor<R>): Promise<R> {
    return TypeORMHelper.startReadonlyTx(BaseTenantService.TX_SET, this, func);
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
