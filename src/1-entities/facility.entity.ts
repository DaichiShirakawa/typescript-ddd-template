import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 } from "uuid";
import { Tenant } from "./tenant.entity";
import { TenantScopedEntity } from "./base/tenant-scoped-entity";

/**
 * テナントに属する施設
 */
@Entity("facilities")
export class Facility extends TenantScopedEntity<Facility> {
  @PrimaryColumn({ length: 48 })
  readonly id: string = `facility_${v4()}`;

  @Column({ length: 64 })
  readonly name: string;

  @CreateDateColumn()
  readonly createdAt: Date;
  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Tenant, (t) => t.facilities)
  @JoinColumn({ name: "tenantId", referencedColumnName: "tenantId" })
  readonly tenant: Tenant;
}
