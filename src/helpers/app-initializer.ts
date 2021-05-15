import "reflect-metadata"; // required by TypeORM
import { createConnection, getConnectionOptions } from "typeorm";
import { BaseTenantService } from "../3-services/base/base-tenant-service";
import { TxProcessor } from "../3-services/base/transaction";
import { TenantService } from "../3-services/tenant.service";
import { AllTransaction } from "../5-infrastructure/all-transaction";
import { TransactionHelper } from "../5-infrastructure/transaction-helper";
import { ContextHolder } from "../express/context/base-context";
import * as ENTITIES from "./entities-index";
import "./env-def";
import { AllReadonlyTransaction } from "../5-infrastructure/all-readonly-transaction";
import { TenantTransaction } from "../5-infrastructure/tenant-transaction";
import { TenantReadonlyTransaction } from "../5-infrastructure/tenant-readonly-transaction";
import { TenantContext } from "../express/context/tenant-context";

export async function initializeApp() {
  TenantService.initialize(
    // tx
    (ch: ContextHolder, func: TxProcessor<AllTransaction>) =>
      TransactionHelper.start(AllTransaction, ch, func),
    // readonly tx
    (ch: ContextHolder, func: TxProcessor<AllReadonlyTransaction>) =>
      TransactionHelper.start(AllReadonlyTransaction, ch, func)
  );

  BaseTenantService.initialize(
    // tx
    (ch: ContextHolder<TenantContext>, func: TxProcessor<TenantTransaction>) =>
      TransactionHelper.start(TenantTransaction, ch, func),
    // readonly tx
    (
      ch: ContextHolder<TenantContext>,
      func: TxProcessor<TenantReadonlyTransaction>
    ) => TransactionHelper.start(TenantReadonlyTransaction, ch, func)
  );

  await ormPromise;
}

const ormPromise = new Promise<void>(async (resolve, reject) => {
  return;
  try {
    const opts = await getConnectionOptions();
    const entities = Object.values(ENTITIES);
    await createConnection({
      ...opts,
      // optsのままだとうまく行かないので、indexを作ってそこにファイル単位で登録するようにした
      entities: entities as any,
      migrations: [], // migrationの中身もなぜか読まれてエラー出る
      subscribers: [],
    });
    console.debug(`DB Connection created`);
    resolve();
  } catch (e) {
    console.error(`Failed to TypeORM.createConnection`, e);
    reject(e);
  }
});
