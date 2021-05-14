import { MyBaseEntity } from "../1-entities/_base-entity";
import { TenantEntity } from "../1-entities/_tenant-entity";
import { BaseContext, ContextHolder } from "../express/security/base-context";

export type SubModelOrEntities = {
  [entityName: string]: MyBaseEntity | MyBaseEntity[] | BaseModel | BaseModel[];
};

/**
 * Model は自身に属する Entities を管理します。
 * それにより、 TenantTransaction から save すべき Entities を特定します。
 *
 * Entities だけではなく、 Entities を内包する Model をサブモデルとして持つこともできます。
 */
export abstract class BaseModel<E extends SubModelOrEntities = {}>
  implements ContextHolder
{
  readonly context: BaseContext;
  protected readonly entities: E = {} as any;

  constructor(ch: ContextHolder, entities: E) {
    this.context = ch.context;
    this.entities = { ...entities };
  }

  /**
   * このモデルの管理下にある全てのentityを返します
   */
  get entitiesArray(): TenantEntity[] {
    return this.modelToEntities(this);
  }

  private modelToEntities(model: BaseModel, result = []): TenantEntity[] {
    const entities: TenantEntity[] = [];

    for (const name in model.entities) {
      const data = (model.entities as any)[name];
      if (Array.isArray(data)) {
        for (const e of data) {
          if (e instanceof BaseModel) {
            entities.push(...this.modelToEntities(e));
          } else if (e instanceof TenantEntity) {
            entities.push(e);
          }
        }
      } else if (data instanceof BaseModel) {
        entities.push(...this.modelToEntities(data));
      } else if (data instanceof TenantEntity) {
        entities.push(data);
      }
    }

    return entities;
  }

  get freezedEntities() {
    return Object.freeze({ ...this.entities });
  }

  /**
   * Transaction から Save 結果を Model.entities に反映する用途
   */
  txUpdateEntities(func: (entities: any) => void) {
    func(this.entities);
  }
}
