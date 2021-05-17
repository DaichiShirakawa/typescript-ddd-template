# typescript-ddd-template

TypeScript でレイヤ間疎結合を意識したドメイン駆動開発してみたので、テンプレートとして公開する。

- 実装 to ドキュメントができる作りにしている
  - [ER 図](documents/er-diagram.md)自動生成
  - [Swagger.json](src/express/tsoa-generated/swagger.json) 自動生成
- オニオンアーキテクチャを参考にしている
  - 詳しくは [DDD](#ddd) で
- Tenant-scoped な制御実装している
  - Tenant = 顧客(例えばユーザーとなる会社)の単位
  - Tenant-scoped = ある Tenant のコンテキストからは他の Tenant のデータは隠蔽される
  - Model, Infrastructure(+ Entity) で制御が行われている

## How to Serve

```
# run without inspect
npm start
npm run test

# inspect & hooking from VSCode Debug
npm run debug
npm run test:debug
```

## 3rd-party Libraries

- [TypeORM](https://typeorm.io/)
  - Entity の定義
    - 兼 テーブル定義 / リレーション定義
  - DB へのアクセス (本プロジェクトでは MySQL を想定)
- [typeorm-uml](https://github.com/eugene-manuilov/typeorm-uml)
  - TypeORM で記述した Entities を PlantUML-ERDiagram に書き起こす
- [Express](https://expressjs.com/ja/)
- [tsoa](https://tsoa-community.github.io/docs/)
  - Express Controller Wrapper
  - Controller 記述 -> swagger.json 出力
- [luxon](https://moment.github.io/luxon/)

## DDD

- ライトなオニオンアーキテクチャ
- `src/` 以下ディレクトリの prefix (0~4) がレイヤのレベルを示している
- 完全なレイヤ間疎結合ではない
  - TypeORM を使って Entity を定義している
    - テーブル設計の内容やリレーションが Entity レイヤで記述されている
  - 最低レイヤは Entity の interface のみ定義すべきかもしれないが、開発効率のためにそうしている

### Layer-rules

1. あるレイヤから import できるのは、自分よりも低いレベルのレイヤのみ
   - ✅ `4-presentation/*` -> `3-services/*`
   - ✅ `4-presentation/*` -> `2-models/*`
   - ❌ `4-presentation/*` -> `4-infrastructure/*`
   - ❌ `3-services/*` -> `4-infrastructure/*`
   - ❌ `4-presentation/*` -> `express/*`
2. `n-layer/base` ではそのレイヤの基底概念を実装し、`base/*` からは `base/*` 以外の自レイヤコードを import することはできない
   - ✅ `1-entities/base/*` -> `1-entities/base`
   - ✅ `1-entities/base/*` -> `0-base/*`
   - ❌ `1-entities/base/*` -> `1-entities/*`
3. レイヤに属しないソースからの import は自由である
   - ✅ `express` -> `*/*`
   - ( ❌ `4-presentation/*` -> `express` from )

### Layers

#### 0-base

どこからでも使う共通概念を実装するレイヤ

- Error 定義
- Logger 定義
- Context 定義
  - いまどんな文脈でコードが実行されているかを管理

#### 1-entities

プロジェクトが提供するサービスの基底となるデータ構造の定義と、
ついでに TypeORM によるテーブル定義・リレーション定義

- すべての Entity は Immutable

#### 2-models

Entity のマネジメント・コントロールを司るサービスレイヤ

- Entity の CRUD に係る Validation はすべて Model で行う

#### 3-services

複数の Model と Transaction 処理を利用して機能を提供するサービスレイヤ

- 基底 Transaction の定義
- Transaction からの Entity の読み込み
- Entity -> Model 生成

#### 4-infrastructure

Transaction の実装

- TypeORM x MySQL

#### 4-presentation

いわゆる Controller 層、API の定義

- tsoa

## Tenant-scoped

- Entity(テーブル設計)
  - Tenant に属するすべてのデータは PrimaryKey として tenantId をもつ
- Model
  - Tenant-scoped なモデルは同じ Tenant に属する Entity しか扱うことができない
- Infrastructure
  - Tenant-scoped な Transaction では DB アクセスの際に tenantId がキーとして自動付与される

## Tools

### generate-er-diagram

Entities の定義をもとに [`documents/er-diagram.md`](documents/er-diagram.md) を自動生成

### generate-tsoa-routes

Presentation の定義をもとに `src/express/tsoa-generated`を自動生成

- swagger.json
- routes.ts

### validate-ddd-layers

[Layer-rules](#layer-rules) の違反を検出する

## Connect to DB

- 3 つの SSL キーを `/typeorm/develop-keys` へ配置
  - /typeorm/develop-keys/client-cert.pem
  - /typeorm/develop-keys/client-key.pem
  - /typeorm/develop-keys/server-ca.pem
- `develop-keys` と言っているものの本番環境との接続情報の切り替え等はまだ想定してない(TODO)

## DB Migrations

- `npm run migration:generate`
  - 現行 DB に対する現行 Entities の差分を SQL として `typeorm/migrations/` へ出力
- `npm run migration:run`
  - `migrations` のうち現行 DB に適用されていないスクリプトを実行
- `npm run migration:revert`
  - 直前の `migration:run` を巻き戻す

## TODO

- Logging を整える
- 環境ごとの接続情報の管理
