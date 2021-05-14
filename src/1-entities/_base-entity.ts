import cloneDeep from "lodash/cloneDeep";
import { getRepository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

/**
 * テナントに属しないデータはこれを継承します。
 * entity instance はすべて immutable の想定です。
 */
export abstract class MyBaseEntity<T extends MyBaseEntity<any> = any> {
  abstract get id(): string;

  public constructor(init: Partial<T>) {
    Object.assign(this, init);
  }

  /**
   * 自身をcloneし、changesの内容をシャローコピーでかぶせて返します。
   * changes[key]===null の場合かぶせますが、
   * changes[key]===undefined の場合はその要素はかぶせません。
   *
   * @param changes
   * @returns clone with changes
   */
  public clone(changes: Partial<T>): T {
    changes = { ...changes };
    for (const key in changes) {
      if ((changes as any)[key] === undefined) delete (changes as any)[key];
    }
    const clone: T = cloneDeep(this) as any;
    Object.assign(clone, {
      ...changes,
      _txNeedUpdate: true,
    });

    return clone;
  }

  get asTypeORMSaveEntity(): QueryDeepPartialEntity<any> {
    const { columns } = getRepository(this.constructor).metadata;
    const result: any = {};

    for (const column of columns) {
      if (column.isCreateDate || column.isUpdateDate) {
        continue;
      }
      let value = (this as any)[column.propertyName];
      result[column.propertyName] = value;
    }

    return result;
  }

  /**
   * APIの外に返すEntityに変換
   * 内部管理用フィールドを含まず、純粋なColumnのみ含むようになる
   * また、 relation は responseWith() で指定した場合のみ含む
   */
  get asResponseEntity(): any {
    const { columns } = getRepository(this.constructor).metadata;
    const result: any = {};

    for (const column of columns) {
      let value = (this as any)[column.propertyName];
      result[column.propertyName] = value;
    }

    return result;
  }

  /****************************
   * 以下、 Transaction 管理のための仕組み
   ****************************/

  static CURRENT_INSTANCE_SEQ = 1; // プロセス内のインスタンス一意に番号ふるためのシーケンス

  /**
   * プロセスに内で生成されたモデルの番号
   */
  readonly _instanceSeq: number;
  /**
   * constructor を経由したときのみ true
   */
  private _txNeedInsert: boolean = false;
  /**
   * clone を経由したときのみ true
   */
  private _txNeedUpdate: boolean = false;
  private _txInserted: boolean = false;
  private _txUpdated: boolean = false;

  get txNeedInsert() {
    return this._txNeedInsert && !this._txInserted;
  }

  get txNeedUpdate() {
    return this._txNeedUpdate && !this._txUpdated;
  }

  get txInserted() {
    return this._txInserted;
  }

  get txUpdated() {
    return this._txUpdated;
  }

  txSaved() {
    this._txInserted = this._txNeedInsert;
    this._txUpdated = this._txNeedUpdate;
    this._txNeedInsert = false;
    this._txNeedUpdate = false;

    return this;
  }
}
