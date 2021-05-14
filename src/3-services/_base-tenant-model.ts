import { Tenant } from "../1-entities/tenant.entity";
import { TxProcessor } from "../5-infrastructure/base-transaction";
import { ReadonlyTenantTransaction } from "../5-infrastructure/readonly-tenant-transaction";
import { TenantTransaction } from "../5-infrastructure/tenant-transaction";
import { TenantContext } from "../express/security/tenant-context";
import { BaseService } from "./_base-service";

export abstract class BaseTenantService extends BaseService<TenantContext> {
  get tenant(): Tenant {
    return this.context.tenant;
  }

  get tenantId(): string {
    return this.context.tenantId;
  }

  /**
   * 現在のコンテキストに基づいて、Tenant依存のデータを読み書きするトランザクションを開始します。
   * model 処理の中で発生した TenantEvents を保存するため、 models もリレーします。
   * @see {TenantTransaction}
   */
  protected transaction<T>(
    func: TxProcessor<TenantTransaction, T>
  ): Promise<T> {
    return TenantTransaction.start(this, func);
  }

  /**
   * 保存処理が発生しない場合にのみ使ってください。
   */
  protected findTransaction<T>(func: (tx: TenantTransaction) => Promise<T>) {
    return ReadonlyTenantTransaction.start(this, async (tx) => ({
      returns: () => func(tx),
      saveModels: [],
    }));
  }
}
