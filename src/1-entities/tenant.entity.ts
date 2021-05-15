import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 } from "uuid";
import { Facility } from "./facility.entity";
import { MyBaseEntity } from "./base/base-entity";

/**
 * テナント(お客様組織)
 */
@Entity("tenants")
export class Tenant extends MyBaseEntity<Tenant> {
  constructor(init: Partial<Omit<Tenant, "tenantId">>) {
    super({ ...init, tenantId: `tenant_${v4()}` });
  }

  @PrimaryColumn({ length: 48 })
  readonly tenantId: string;

  get id() {
    return this.tenantId;
  }

  /**
   * コンソールなどでも表示される、エンドユーザーが認識しやすい名称
   * 例: "株式会社しらかわ"
   */
  @Column()
  readonly name: string;
  /**
   * URLの一部などに利用される、開発者が認識しやすい名称
   * 例: "my-company"
   */
  @Column()
  readonly code: string;

  @CreateDateColumn()
  readonly createdAt: Date;
  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => Facility, (o) => o.tenant)
  readonly facilities: Facility[];
}
