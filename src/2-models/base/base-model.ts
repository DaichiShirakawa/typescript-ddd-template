import { Context, ContextHolder } from "../../0-base/context";
import { HttpsError } from "../../0-base/https-error";
import { ArrayElement, NonArrayElement } from "../../0-base/type-helper";
import { MyBaseEntity } from "../../1-entities/base/base-entity";

export type ModelDependency = MyBaseEntity | BaseModel;
export type ModelArrayDependency = ReadonlyArray<ModelDependency>;
export type ModelDependencies = {
  [name: string]: undefined | ModelDependency | ModelArrayDependency;
};

/**
 * DDD におけるドメイン層のイメージ
 *
 * - 自身に属する Dependencies Models を保持する
 * - Entities の変更とバリデーションを司る
 * - Transaction から Save される際 Entities / Sub Models すべてが対象となる
 */
export abstract class BaseModel<
  C extends Context = Context,
  D extends ModelDependencies = {}
> implements ContextHolder<C>
{
  readonly context: C;
  private readonly _dependencies: D = {} as any;
  /**
   * Model が一意に定まるIDを返す
   * (メインの Entity.id など)
   */
  abstract id: string;

  constructor(ch: ContextHolder<C>, dependencies: D) {
    this.context = ch.context;
    this._dependencies = { ...dependencies };
  }

  get dependencies(): Readonly<D> {
    return Object.freeze({ ...this._dependencies });
  }

  /**
   * undefined な Dependency をセットできる
   * @param key
   * @param data
   */
  protected set<K extends keyof D>(key: K, data: NonArrayElement<D[K]>) {
    const current = this._dependencies[key];
    if (current != null) {
      throw new HttpsError(
        "internal",
        `Can not set non-null dependency: "${key}"`
      );
    }
    this._dependencies[key] = data;
  }

  /**
   * ArrayDependency に要素を追加することができる
   * @param data 追加したい要素
   */
  protected add<K extends keyof D>(key: K, data: ArrayElement<D[K]>) {
    const current = this._dependencies[key];
    if (!Array.isArray(current)) {
      throw new HttpsError(
        "internal",
        `Can not add data to non-Array dependency`
      );
    }

    if (current.some((e) => e.id === data.id)) {
      throw new HttpsError("internal", `${data.id} already exists in ${key}`);
    }

    if (current[0] && current[0].constructor.name !== data.constructor.name) {
      throw new HttpsError("internal", `Data type not matched`, {
        currentFirstElementType: current[0].constructor.name,
        dataType: data.constructor.name,
      });
    }

    const next = [...current];
    next.push(data);
    (this._dependencies as any)[key] = next;
  }

  /**
   * key を自動判別して特定の Dependency を更新する
   * ArrayDependency の内容も更新可能
   *
   * @param updated 新しい値
   */
  protected update(updated: ModelDependency): void {
    for (const [key, value] of Object.entries(this._dependencies)) {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (this.setIfMatched(key, i, value[i], updated)) return;
        }
      } else {
        if (this.setIfMatched(key, -1, value as ModelDependency, updated))
          return;
      }
    }

    throw new HttpsError(`internal`, `Dependency of ${updated.id} not found`);
  }

  private setIfMatched = (
    key: string,
    arrayIndex: number,
    current: ModelDependency,
    updated: ModelDependency
  ): boolean => {
    if (
      ((current instanceof MyBaseEntity && updated instanceof MyBaseEntity) ||
        (current instanceof BaseModel && updated instanceof BaseModel)) &&
      current.id === updated.id
    ) {
      if (0 <= arrayIndex) {
        const arr = [...(this._dependencies as any)[key]];
        arr[arrayIndex] = updated;
        (this._dependencies as any)[key] = arr;
      } else {
        (this._dependencies as any)[key] = updated as any;
      }
      return true;
    }
    return false;
  };

  /**
   * Transaction による保存済みのデータを Dependencies へ反映
   * 反映しなくては DB による自動採番結果等を読むことが出来ない場合があるため
   *
   * @deprecated 本来公開すべきではないが、 Transaction から限定で呼ぶことを許可する
   */
  dangerUpdateFromTransaction(updated: MyBaseEntity) {
    this.update(updated);
  }
}
