import "reflect-metadata"; // required by TypeORM
import { createConnection, getConnectionOptions } from "typeorm";
import * as ENTITIES from "./entities-index";

export function initializeTypeORM() {
  return promise;
}

const promise = new Promise<void>(async (resolve, reject) => {
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
