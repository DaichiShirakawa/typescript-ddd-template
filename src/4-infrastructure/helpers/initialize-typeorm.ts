import "reflect-metadata"; // required by TypeORM
import { createConnection, getConnectionOptions } from "typeorm";
import { BaseService } from "../../3-services/base/base-service";
import { TenantScopedService } from "../../3-services/base/tenant-scoped-service";
import { TypeORMTenantScopedTx } from "../typeorm/typeorm-tenant-scoped-tx";
import { TypeORMTx } from "../typeorm/typeorm-tx";
import * as ENTITIES from "./entities-index";
import { Env } from "../../0-base/env-def";

export function initializeTypeORM() {
  return promise;
}

const promise = new Promise<void>(async (resolve) => {
  try {
    const opts = await getConnectionOptions();
    const entities = Object.values(ENTITIES);
    await createConnection({
      ...opts,
      logging: Env.NODE_ENV === "test",
      // optsのままだとうまく行かないので、indexを作ってそこにファイル単位で登録するようにした
      entities: entities as any,
      migrations: [], // migrationの中身もなぜか読まれてエラー出る
      subscribers: [],
    });
    console.debug(`DB Connection created`);

    BaseService.TX_STARTERS = {
      tx: TypeORMTx.startTx,
      readonlyTx: TypeORMTx.startReadonlyTx,
    };

    TenantScopedService.TX_STARTERS = {
      tx: TypeORMTenantScopedTx.startTx,
      readonlyTx: TypeORMTenantScopedTx.startReadonlyTx,
    };

    resolve();
  } catch (e) {
    console.error(e);
    console.error(
      `Failed to TypeORM.createConnection, using default Transaction`
    );
    resolve();
  }
});
