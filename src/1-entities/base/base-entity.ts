import cloneDeep from "lodash/cloneDeep";

/**
 * TypeORM エンティティはすべてこれを継承する
 * エンティティはすべて immutable な作りである想定
 *
 * - DB への insert / update の要求状態を保持
 * - immutable object を想定した update({...values}) を定義
 *
 */
export abstract class MyBaseEntity<T extends MyBaseEntity<any> = any> {
  /**
   * データの一意性を判定するために必ず定義する
   */
  abstract get id(): string;

  /**
   * - 新規エンティティデータを生成する場合
   * - (TypeORM 経由で DB から Read された場合)
   * 2通りのみ呼ばれる
   *
   * @param init
   */
  public constructor(init: Partial<T>) {
    Object.assign(this, init);

    if (init != null) {
      // TypeORM から生成の場合 init==null
      this._txNeedInsert = true;
    }
  }

  /**
   * 自身を clone し、changesの内容をシャローコピーでかぶせて返す
   * また、DBアップデート要求フラグを立てる
   *
   * changes[key] === null -> cloned[key] = null
   * changes[key] === undefined -> cloned[key] = this[key]
   *
   * @param changes 変更したいプロパティ
   * @returns 自身の clone に changes の内容をかぶせたインスタンス
   */
  public set(changes: Partial<T>): T {
    changes = { ...changes };

    for (const key in changes) {
      if ((changes as any)[key] === undefined) delete (changes as any)[key];
    }

    const clone: T = cloneDeep(this) as any;
    Object.assign(clone, {
      ...changes,
    });

    clone._txUpdatedPropNames = Object.keys(changes);
    return clone;
  }

  static CURRENT_TX_SEQ = 1;

  readonly txSeq = MyBaseEntity.CURRENT_TX_SEQ++;
  private _txNeedInsert: boolean = false;
  private _txUpdatedPropNames: null | (keyof T)[] = null;

  get isNeedInsert() {
    return this._txNeedInsert;
  }

  get updatedPropNames() {
    return this._txUpdatedPropNames;
  }

  /**
   * Transaction から Save が完了したときに呼ぶ
   */
  saved() {
    this._txNeedInsert = true;
    this._txUpdatedPropNames = null;
  }
}
