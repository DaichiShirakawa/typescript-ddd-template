import { Column } from "typeorm";
import { v4 } from "uuid";
import { MyBaseEntity } from "../base-entity";

export class TestBaseEntity extends MyBaseEntity<TestBaseEntity> {
  @Column()
  readonly id: string = `test_${v4()}`;
  @Column()
  readonly seq: number;
}
