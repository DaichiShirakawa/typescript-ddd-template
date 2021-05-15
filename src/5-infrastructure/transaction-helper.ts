import { EntityManager, FindConditions, getConnection } from "typeorm";
import { MyBaseEntity } from "../1-entities/base/base-entity";
import { BaseModel } from "../2-models/base/base-model";
import {
  SavedTarget,
  SaveTarget,
  Transaction,
  TxProcessor,
} from "../3-services/base/transaction";
import { HttpsError } from "../express/https-error";
import { Context, ContextHolder } from "../express/context/base-context";

export class TransactionHelper {
  /**
   * models 管理下にあるすべての entities を Save したあとに returns() の結果を返す
   */
  static async start<Tx extends Transaction, C extends Context, R>(
    txClass: new (tx: EntityManager, ch: ContextHolder<C>) => Tx,
    ch: ContextHolder<C>,
    func: TxProcessor<R>
  ): Promise<R> {
    const qr = getConnection().createQueryRunner();
    try {
      console.error(`Start BaseTransaction`);
      await qr.startTransaction();
      const tx = new txClass(qr.manager, ch);
      const result = await func(tx);

      const saveTargets = result.saveModels.flatMap((model) =>
        TransactionHelper.toSaveTargets(model)
      );

      TransactionHelper.checkDuplicate(saveTargets);

      const savedTargets = await tx.save(saveTargets);

      if (result.statistics) {
        result.statistics({ savedTargets });
      }

      console.error(`Commit BaseTransaction`);
      await qr.commitTransaction();
      savedTargets.forEach((e) => e.entity.saved());

      return result.returns ? result.returns() : (undefined as any);
    } catch (e) {
      console.error(`Rollback BaseTransaction`);
      await qr.rollbackTransaction().catch();
      throw e;
    }
  }

  /**
   * entity の @PrimaryKey を自動検出して where 句に詰めます
   * @param entity
   * @returns
   */
  static toPrimaryWhere<T extends MyBaseEntity>(entity: T): FindConditions<T> {
    const meta = getConnection().getMetadata(entity.constructor);
    const where: FindConditions<T> = {};
    for (const col of meta.columns.filter((col) => col.isPrimary)) {
      (where as any)[col.propertyName] = (entity as any)[col.propertyName];
    }
    return where;
  }

  /**
   * @param models
   * @returns 配列化された model / entity の組み合わせ
   */
  static toSaveTargets(model: BaseModel): SaveTarget[] {
    const result: SaveTarget[] = [];
    const dependencies = model.dependencies;

    const push = (
      name: string,
      data: BaseModel | MyBaseEntity,
      arrayIndex?: number
    ) => {
      if (data instanceof BaseModel) {
        result.push(...TransactionHelper.toSaveTargets(data));
      } else if (data instanceof MyBaseEntity) {
        result.push({
          model: model,
          dependencyName: name,
          dependencyArrayIndex: arrayIndex,
          entity: data,
        });
      }
    };

    for (const key in dependencies) {
      const data = (dependencies as any)[key];
      if (Array.isArray(data)) {
        data.forEach((each, index) => push(key, each, index));
      } else {
        push(key, data);
      }
    }

    return result;
  }

  /**
   * @param targets 重複 Entity を含むなら throw
   */
  static checkDuplicate(targets: SaveTarget[]) {
    const map: { [entityKey: string]: SaveTarget[] } = {};

    for (const target of targets) {
      const entityKey = `${target.entity.constructor.name}@${target.entity.id}`;
      map[entityKey] = [...(map[entityKey] || []), target];
    }

    const duplicates = Object.entries(map).filter(
      ([target]) => 2 <= target.length
    );

    if (duplicates.length === 0) return;

    throw new HttpsError(
      "internal",
      `Detected duplicated SaveTargets:\n${duplicates.map(
        ([entityKey, targets]) =>
          `${entityKey} from ${targets.map((t) => t.model.constructor.name)}`
      )}`
    );
  }

  /**
   * target.dependency.savedData を target.model.entities に反映
   * Save 時の自動採番プロパティ等を Model に反映する用途を想定
   *
   * @param savedTargets
   */
  static updateDependencies(savedTargets: SavedTarget[]) {
    for (const target of savedTargets) {
      target.model.dangerUpdateFromTransaction(
        target.dependencyName,
        target.savedEntity,
        target.dependencyArrayIndex
      );
    }
  }
}
