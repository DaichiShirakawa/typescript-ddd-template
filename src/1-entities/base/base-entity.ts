import cloneDeep from "lodash/cloneDeep";

/**
 * TypeORM エンティティはすべてこれを継承する
 * エンティティはすべて immutable な作りである想定
 */
export abstract class MyBaseEntity<SELF extends MyBaseEntity = any> {
  static CURRENT_INSTANCE_SEQ = 1;

  private readonly _entityMeta: EntityInstanceMeta<SELF>;

  /**
   * - 新しく生成されたエンティティデータであるか
   * - 変更があった場合、どのプロパティか
   * - インスタンス連番 (clone による前後関係を表現するためのもの)
   */
  get instanceMeta() {
    return this._entityMeta;
  }

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

    this._entityMeta = {
      instanceSeq: MyBaseEntity.CURRENT_INSTANCE_SEQ++,
      // TypeORM から生成の場合 init==null
      isNewEntity: init != null,
      updatedProps: new Set<keyof SELF>(),
    };
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
      _instanceMeta: {
        ...clone._entityMeta,
        updatedProps: new Set([
          ...clone._entityMeta.updatedProps,
          ...Object.keys(changes),
        ]),
      },
    });

    return clone;
  }
}

type EntityInstanceMeta<SELF extends MyBaseEntity> = {
  instanceSeq: number;
  isNewEntity: boolean;
  updatedProps: ReadonlySet<keyof SELF>;
};
