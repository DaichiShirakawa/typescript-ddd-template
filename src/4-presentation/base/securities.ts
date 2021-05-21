export enum Securities {
  /**
   * サンプルなどのノーガードAPI
   */
  NONE = "NONE",
  /**
   * Https API
   */
  API = "API",
}

export enum Scopes {
  /**
   * システム管理者に限定されたスコープ
   */
  SUPER = "SUPER",
  /**
   * 特定の Tenant に限定された Scope
   */
  TENANT = "TENANT",
}
