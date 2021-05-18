import { HttpsError } from "./https-error";

/**
 * 以下を表現する構造体
 *
 * 1. どういった文脈でプログラムが実行されているか (dataset)
 *    (例) 特定のユーザーとして認証され、特定のテナントに属しているデータの操作のみを認可されている
 *
 * 2. その文脈の根拠となる文脈 (source)
 *    (例): その根拠は特定の HTTP リクエストである
 */
export abstract class Context<DATASET = {}> {
  protected readonly dataset: DATASET;
  private readonly _source?: Context;

  constructor(dataset: DATASET & { source?: ContextHolder | Context }) {
    const { source } = dataset;

    if (source) {
      this._source = source instanceof Context ? source : source.context;
    }

    this.dataset = { ...dataset };
    delete (this.dataset as any).source;
  }

  public get hasSource() {
    return this._source != null;
  }

  public get source(): Context<any> {
    if (this._source == null) {
      throw new HttpsError("internal", `No source context`);
    }
    return this._source;
  }

  /**
   * 自分またはsourceをさかのぼって目的のContextを見つける
   *
   * @param contextClass 要求するContext
   * @returns 見つからなければ null
   */
  public pick<C extends Context>(
    contextClass: new (...args: any[]) => C
  ): C | null {
    for (
      let cursor: Context | undefined = this;
      cursor != null;
      cursor = cursor._source
    ) {
      if (cursor.constructor.name === contextClass.name) {
        return cursor as C;
      }
    }
    return null;
  }

  /**
   * 自分またはsourceをさかのぼって目的のContextを保有しているかを調べる
   *
   * @param contextClass 要求するContext
   */
  public has<C extends Context>(
    contextClass: new (...args: any[]) => C
  ): boolean {
    return this.pick(contextClass) != null;
  }
}

export type ContextHolder<C extends Context = any> = {
  context: C;
};
