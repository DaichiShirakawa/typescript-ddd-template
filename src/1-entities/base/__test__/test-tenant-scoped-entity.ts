import { Column } from "typeorm";
import { v4 } from "uuid";
import { TenantScopedEntity } from "../tenant-scoped-entity";

export class TestTenantScopedEntity extends TenantScopedEntity<TestTenantScopedEntity> {
  @Column()
  readonly id: string = `test_${v4()}`;
  @Column()
  readonly seq: number;
}
