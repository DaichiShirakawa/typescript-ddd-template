import "reflect-metadata"; // required by TypeORM
import { ConnectionOptions, createConnection, getConnection } from "typeorm";
import { logs } from "../../0-base/logs-context";
import * as ENTITIES from "./entities-index";

export async function initializeTypeORM() {
  try {
    getConnection();
  } catch (ignored) {
    await createConnection(options())
      .then((r) => {
        logs().debug(`DB Connection created`);
      })
      .catch((e) => {
        logs().error(e);
        logs().error(
          `Failed to TypeORM.createConnection, using default Transaction`
        );
      });
  }
}

function options(): ConnectionOptions {
  const entities = Object.values(ENTITIES) as any;
  const result = { ...require("../../../ormconfig") };

  result.entities = entities;
  delete result.migrations;
  delete result.subscribers;

  return result;
}
