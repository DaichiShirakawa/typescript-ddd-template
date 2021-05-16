import {
  EntityManager,
  FindConditions,
  getConnection,
  getRepository,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { Context, ContextHolder } from "../../0-definitions/context";
import { HttpsError } from "../../0-definitions/https-error";
import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { BaseModel } from "../../2-models/base/base-model";
import {
  ReadonlyTxProcessor,
  SavedTarget,
  SaveTarget,
  Transaction,
} from "../../3-services/base/transaction";

export class TypeORMHelper {
  /**
   * Save すべきプロパティに絞ったオブジェクトを返す
   *
   * そのまま Entity 全体を指定して Update すると、
   * UpdatedAtColumn 等意図しないフィールドまで含まれるため、
   * Save する場合はこれを用いる。
   */
  static asSaveEntity<E extends MyBaseEntity>(
    entity: E
  ): QueryDeepPartialEntity<E> {
    const { columns } = getRepository(entity.constructor).metadata;
    const result: any = {};

    for (const col of columns) {
      if (col.isCreateDate || col.isUpdateDate) {
        continue;
      }
      if (
        entity.instanceMeta.isNewEntity ||
        entity.instanceMeta.updatedProps.has(col.propertyName)
      ) {
        result[col.propertyName] = (entity as any)[col.propertyName];
      }
    }

    return result;
  }

  /**
   * models 管理下にあるすべての entities を Save したあとに returns() の結果を返す
   */
  static async startReadonlyTx<C extends Context, R>(
    txClass: new (tx: EntityManager, ch: ContextHolder<C>) => Transaction,
    ch: ContextHolder<C>,
    func: ReadonlyTxProcessor<R>
  ): Promise<R> {
    const qr = getConnection().createQueryRunner();
    try {
      console.error(`Start ${txClass.constructor.name}`);
      await qr.startTransaction();
      const tx = new txClass(qr.manager, ch);
      const result = await func(tx);

      console.error(`Finish ${txClass.constructor.name}`);
      return result ? result : (undefined as any);
    } catch (e) {
      console.error(`Error on ${txClass.constructor.name}`);
      throw e;
    } finally {
      await qr.rollbackTransaction().catch();
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
        result.push(...TypeORMHelper.toSaveTargets(data));
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