import AsyncHooks, {
  executionAsyncId,
  executionAsyncResource,
} from "async_hooks";
import { v4 } from "uuid";
import { Constructor } from "./type-helper";

type Structure = { [name: string]: any };

/**
 * AsyncHooks の AsyncResource を用いて Context 等を保持する
 * Context だけではく他のデータも保持できる
 */
export class ContextHolder {
  static PROP_NAME = "APP_STRUCTURE";
  private static hook: AsyncHooks.AsyncHook;

  /**
   * AsyncHook を初期化
   */
  private static enable() {
    if (this.hook == null) {
      this.hook = AsyncHooks.createHook({
        init: (asyncId, type, triggerAsyncId, childCR: any) => {
          const parentCR: any = AsyncHooks.executionAsyncResource() || {};
          childCR[ContextHolder.PROP_NAME] = parentCR[ContextHolder.PROP_NAME];
        },
        destroy: (asyncId) => {},
      }).enable();
    }
  }

  private static disable() {
    if (this.hook) {
      this.hook.disable();
      this.hook = null as any;
    }
  }

  static startSession(execId: string = v4()): Structure {
    this.enable();
    const cr: any = executionAsyncResource();

    const structure = (cr[ContextHolder.PROP_NAME] = {
      BaseContext: new BaseContext(executionAsyncId(), execId),
      parentStructure: cr[ContextHolder.PROP_NAME],
    });
    console.debug(`[Context] Start Session ${structure.BaseContext.execId}`);
    return structure;
  }

  static endSession(): Structure {
    const cr: any = executionAsyncResource();
    const structure = cr[ContextHolder.PROP_NAME];
    if (structure == null) {
      throw new Error(`Session not started`);
    }
    cr[ContextHolder.PROP_NAME] = structure.parentStructure;

    console.debug(`[Context] End Session ${structure.asyncId}`);
    return structure;
  }

  static get structure(): Structure {
    const structure: Structure = (executionAsyncResource() as any)[
      ContextHolder.PROP_NAME
    ];
    if (structure == null) {
      throw new Error(`Session not started`);
    }
    return structure;
  }

  /**
   * AsyncResource へ任意の context を保持する
   *
   * @param contextInstance 保持したいデータ (何らかのクラスインスタンスであることが必須)
   * @param name data が何らかのクラスインスタンスの場合不要 (エラーが出る)、それ以外の場合必須
   */
  static set<T>(contextInstance: T): T {
    const name = (contextInstance as any)?.constructor?.name;
    if (name == null) {
      throw new Error(`Can not set non-instance data`);
    }

    if (this.structure[name] != null) {
      throw new Error(`Context ${name} already set`);
    }

    this.structure[name] = contextInstance;
    return contextInstance;
  }

  static has<T>(clazz: Constructor<T>): boolean {
    return this.getOrNull(clazz) != null;
  }

  /**
   * @param clazz のコンテキストが存在していれば throw
   */
  static assertEmpty<T>(clazz: Constructor<T>) {
    if (this.getOrNull(clazz) != null) {
      throw new Error(`Context ${clazz.name} should be empty, but set`);
    }
  }

  /**
   * @param clazz 要求するコンテキストのクラス
   * @returns 要求したコンテキストのインスタンス or (set されていない場合 null)
   */
  static getOrNull<T>(clazz: Constructor<T>): T | null {
    try {
      const name = clazz.name;
      const contextInstance = this.structure[name];
      return contextInstance || null;
    } catch (ignored) {
      return null;
    }
  }

  /**
   * @param clazz 要求するコンテキストのクラス
   * @returns 要求したコンテキストのインスタンス (set されていない場合 throw)
   */
  static get<T>(clazz: Constructor<T>): T {
    const contextInstance = this.getOrNull(clazz);
    if (contextInstance == null) {
      throw new Error(`Requires set ${clazz.name} before call here`);
    }
    return contextInstance;
  }
}

export class BaseContext {
  constructor(readonly asyncId: number, readonly execId: string) {}

  static get instance() {
    return ContextHolder.get(BaseContext);
  }
}
