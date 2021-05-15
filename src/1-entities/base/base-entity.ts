import cloneDeep from "lodash/cloneDeep";

/**
 * TypeORM エンティティはすべてこれを継承する
 * エンティティはすべて immutable な作りである想定
 *
 * - DB への insert / update の要求状態を保持
 * - immutable object を想定した update({...values}) を定義
 *
 */
export abstract class MyBaseEntity<SELF extends MyBaseEntity = any> {
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
  public constructor(init: Partial<SELF>) {
    Object.assign(this, init);

    // TypeORM から生成の場合 init==null
    this.isNewEntity = init != null;
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
  public set(changes: Partial<SELF>): SELF {
    changes = { ...changes };

    for (const key in changes) {
      if ((changes as any)[key] === undefined) delete (changes as any)[key];
    }

    const clone: SELF = cloneDeep(this) as any;
    Object.assign(clone, {
      ...changes,
      isNewEntity: this.isNewEntity,
      updatedProps: new Set([...this.updatedProps, ...Object.keys(changes)]),
    });

    return clone;
  }

  static CURRENT_TX_SEQ = 1;

  readonly txSeq = MyBaseEntity.CURRENT_TX_SEQ++;
  readonly isNewEntity: boolean = false;
  readonly updatedProps: ReadonlySet<keyof SELF> = new Set();
}
