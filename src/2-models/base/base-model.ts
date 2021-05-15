import { MyBaseEntity } from "../../1-entities/base/base-entity";
import { Context, ContextHolder } from "../../express/context/base-context";
import { HttpsError } from "../../express/https-error";

export type ModelDependencies = {
  [name: string]: MyBaseEntity | MyBaseEntity[] | BaseModel | BaseModel[];
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

  constructor(ch: ContextHolder<C>, dependencies: D) {
    this.context = ch.context;
    this._dependencies = { ...dependencies };
  }

  get dependencies(): Readonly<D> {
    return Object.freeze(this.dependencies);
  }

  /**
   * Dependencies の内容はここを通じてしか変更できません
   * @param name 変更したい Dependency の名前
   * @param updated 新しい値
   */
  protected update<K extends keyof D>(name: K, updated: D[K]): D[K] {
    this._dependencies[name] = updated;
    return updated;
  }

  /**
   * Transaction による保存済みのデータを Dependencies へ反映
   * 反映しなくては DB による自動採番結果等を読むことが出来ない場合があるため
   *
   * @deprecated 本来公開すべきではないが、 Transaction から限定で呼ぶことを許可する
   */
  dangerUpdateFromTransaction(
    name: string,
    updated: MyBaseEntity,
    arrayIndex?: number
  ) {
    let arr = null;
    let before = this._dependencies[name];

    if (arrayIndex) {
      arr = before;
      before = ((arr as any) || [])[arrayIndex];
    }

    if (!(before instanceof MyBaseEntity)) {
      throw new HttpsError("internal", `Before data is not Entity`, {
        name,
        arrayIndex,
        before,
      });
    }

    if (
      before?.constructor?.name !== updated.constructor.name ||
      before?.id !== updated.constructor.name
    ) {
      throw new HttpsError("internal", `Update Entity not matched`, {
        before,
        updated,
      });
    }

    if (arrayIndex) {
      (arr as any[])[arrayIndex] = updated;
      (this._dependencies as any)[name] = arr;
    } else {
      (this._dependencies as any)[name] = updated;
    }
  }
}
