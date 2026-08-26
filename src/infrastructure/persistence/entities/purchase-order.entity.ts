import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CORE_SCHEMA, ECoreTableName } from './e-core-table-name';
import { OrganizationEntity } from './organization.entity';
import { SupplierEntity } from './supplier.entity';
import { UserEntity } from './user.entity';
import { PurchaseItemEntity } from './purchase-item.entity';
import { EPurchaseOrderStatus } from '../../../application/shared/enums';

const PK_NAME = 'PK_' + ECoreTableName.PurchaseOrders;

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.PurchaseOrders })
export class PurchaseOrderEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap()
  @Column({ type: 'uuid' })
  public organizationId: string;

  @AutoMap()
  @Column({ type: 'uuid' })
  public supplierId: string;

  @AutoMap()
  @Column({ type: 'uuid', nullable: true })
  public createdById?: string;

  /** Human-readable PO number e.g. PO-2026-00001 */
  @AutoMap()
  @Column({ type: 'varchar', length: 50, unique: true })
  public poNumber: string;

  @AutoMap(() => String)
  @Column({
    type: 'enum',
    enum: EPurchaseOrderStatus,
    default: EPurchaseOrderStatus.Draft,
  })
  public status: EPurchaseOrderStatus;

  /** Expected delivery date */
  @AutoMap(() => Date)
  @Column({ type: 'timestamp', nullable: true })
  public expectedAt?: Date;

  /** Actual date all items received */
  @AutoMap(() => Date)
  @Column({ type: 'timestamp', nullable: true })
  public receivedAt?: Date;

  @AutoMap()
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  public totalAmount: number;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  public notes?: string;

  @AutoMap(() => Date)
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @AutoMap(() => Date)
  @UpdateDateColumn({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  public updatedAt?: Date;

  // ─── Relations ──────────────────────────────────────────────────────────────

  @AutoMap(() => OrganizationEntity)
  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.PurchaseOrders}__${ECoreTableName.Organizations}`,
  })
  public organization: OrganizationEntity;

  @AutoMap(() => SupplierEntity)
  @ManyToOne(() => SupplierEntity, (sup) => sup.purchaseOrders)
  @JoinColumn({
    name: 'supplier_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.PurchaseOrders}__${ECoreTableName.Suppliers}`,
  })
  public supplier: SupplierEntity;

  @AutoMap(() => UserEntity)
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.PurchaseOrders}__${ECoreTableName.Users}`,
  })
  public createdBy?: UserEntity;

  @AutoMap(() => [PurchaseItemEntity])
  @OneToMany(() => PurchaseItemEntity, (pi) => pi.purchaseOrder, { cascade: true })
  public items?: PurchaseItemEntity[];
}
