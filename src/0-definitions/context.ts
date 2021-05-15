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

  constructor(dataset: DATASET & { source?: ContextHolder }) {
    this._source = dataset.source?.context;
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
}

export type ContextHolder<C extends Context = any> = {
  context: C;
};
