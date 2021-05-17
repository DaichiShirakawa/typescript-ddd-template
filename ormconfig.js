const fs = require("fs");

module.exports = {
  type: "mysql",
  host: "",
  port: 3306,
  username: "dev",
  password: "dev",
  database: "my_db",
  synchronize: false,
  logging: false,
  entities: ["src/**/*.entity.ts"], // overwriting in typeorm-initializer.ts
  migrations: ["typeorm/migrations/**/*.ts"], // overwriting in typeorm-initializer.ts
  subscribers: ["typeorm/subscribers/**/*.ts"], // overwriting in typeorm-initializer.ts
  cli: {
    entitiesDir: "src/**/*.entity.ts",
    migrationsDir: "typeorm/migrations/",
    subscribersDir: "typeorm/subscribers/",
  },
  extra: {
    ssl: {
      cert: fs.readFileSync(
        __dirname + "/typeorm/develop_keys/client-cert.pem"
      ),
      key: fs.readFileSync(__dirname + "/typeorm/develop_keys/client-key.pem"),
      ca: fs.readFileSync(__dirname + "/typeorm/develop_keys/server-ca.pem"),
    },
  },
};
