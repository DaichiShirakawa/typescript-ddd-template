import "reflect-metadata"; // required by TypeORM
import { TransactionContext } from "../../3-services/base/transaction-context";
import { TypeORMTenantScopedTx } from "./typeorm-tenant-scoped-tx";
import { TypeORMTx } from "./typeorm-tx";
import { LocalDBTx } from "./local-db-transaction";

export class TransactionFactory {
  static typeORMContext() {
    return new TransactionContext(
      TypeORMTx.startTx,
      TypeORMTx.startReadonlyTx,
      TypeORMTenantScopedTx.startTx,
      TypeORMTenantScopedTx.startReadonlyTx
    );
  }

  static localDBContext() {
    return new TransactionContext(
      LocalDBTx.startTx,
      LocalDBTx.startReadonlyTx,
      LocalDBTx.startTx,
      LocalDBTx.startReadonlyTx
    );
  }
}
