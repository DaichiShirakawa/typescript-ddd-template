import { ContextHolder } from "./context-holder";

/**
 * どういった文脈でプログラムが実行されているか (dataset) を保持する構造体
 * Context のインスタンスは ContextHolder が保持する
 *
 * (例)
 * - 特定のユーザーとして認証され、特定のテナントに属しているデータの操作のみを認可されている
 * - 特定の HTTP リクエストから実行された操作である
 */
export abstract class Context {
  static get instance(): Context {
    throw new Error(`Need override`);
  }

  static get hasInstance(): boolean {
    try {
      this.instance;
      return true;
    } catch (ignored) {
      return false;
    }
  }
}

/**
 * func() を ContextHolder.session で囲んで実行します。
 * func() 内部からは統一した Context が参照できます。
 *
 * @param func 実行したいアプリケーションの実態
 */
export async function withContext(contexts: any[], func: () => any) {
  try {
    ContextHolder.startSession();
    for (const context of contexts) {
      ContextHolder.set(context);
    }
    return await func();
  } finally {
    ContextHolder.endSession();
  }
}
