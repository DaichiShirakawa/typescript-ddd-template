import "reflect-metadata"; // required by TypeORM
import { createConnection, getConnectionOptions } from "typeorm";
import { Env } from "../../0-base/env-def";
import { logs } from "../../0-base/logs-context";
import * as ENTITIES from "./entities-index";

export function initializeTypeORM() {
  return promise;
}

const promise = new Promise<void>(async (resolve) => {
  try {
    const opts = await getConnectionOptions();
    const entities = Object.values(ENTITIES);
    await createConnection({
      ...opts,
      // logging: Env.NODE_ENV === "test",
      // optsのままだとうまく行かないので、indexを作ってそこにファイル単位で登録するようにした
      entities: entities as any,
      migrations: [], // migrationの中身もなぜか読まれてエラー出る
      subscribers: [],
      extra: {
        ...opts.extra,
        socketPath:
          Env.NODE_ENV === "production"
            ? `/cloudsql/${Env.CLOUDSQL_CONNECTION_NAME}`
            : undefined,
      },
    });
    logs().debug(`DB Connection created`);

    resolve();
  } catch (e) {
    logs().error(e);
    logs().error(
      `Failed to TypeORM.createConnection, using default Transaction`
    );
    resolve();
  }
});
