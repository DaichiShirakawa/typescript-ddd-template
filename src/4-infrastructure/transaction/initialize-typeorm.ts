import "reflect-metadata"; // required by TypeORM
import { ConnectionOptions, createConnection, getConnection } from "typeorm";
import { logs } from "../../0-base/logs-context";
import * as ENTITIES from "./entities-index";

export function initializeTypeORM() {
  try {
    getConnection();
  } catch (ignored) {
    return promise;
  }
}

const promise = new Promise<void>(async (resolve) => {
  try {
    await createConnection(options());
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

function options(): ConnectionOptions {
  const entities = Object.values(ENTITIES) as any;
  const result = { ...require("../../../ormconfig") };

  result.entities = entities;
  delete result.migrations;
  delete result.subscribers;

  return result;
}
