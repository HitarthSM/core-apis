import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CORE_SCHEMA, ECoreTableName } from './e-core-table-name';
import { PurchaseItemEntity } from './purchase-item.entity';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { LocationEntity } from './location.entity';
import { UserEntity } from './user.entity';

const PK_NAME = 'PK_' + ECoreTableName.PurchaseItemAllocations;

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.PurchaseItemAllocations })
export class PurchaseItemAllocationEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap()
  @Column({ type: 'uuid' })
  public organizationId: string;

  @AutoMap()
  @Column({ type: 'uuid' })
  public purchaseOrderId: string;

  @AutoMap()
  @Column({ type: 'uuid' })
  public purchaseItemId: string;

  @AutoMap()
  @Column({ type: 'uuid' })
  public locationId: string;

  @AutoMap()
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  public quantity: number;

  @AutoMap()
  @Column({ type: 'uuid', nullable: true })
  public performedById?: string;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  public notes?: string;

  @AutoMap(() => Date)
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  // ─── Relations ──────────────────────────────────────────────────────────────

  @AutoMap(() => PurchaseOrderEntity)
  @ManyToOne(() => PurchaseOrderEntity)
  @JoinColumn({
    name: 'purchase_order_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.PurchaseItemAllocations}__${ECoreTableName.PurchaseOrders}`,
  })
  public purchaseOrder: PurchaseOrderEntity;

  @AutoMap(() => PurchaseItemEntity)
  @ManyToOne(() => PurchaseItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'purchase_item_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.PurchaseItemAllocations}__${ECoreTableName.PurchaseItems}`,
  })
  public purchaseItem: PurchaseItemEntity;

  @AutoMap(() => LocationEntity)
  @ManyToOne(() => LocationEntity)
  @JoinColumn({
    name: 'location_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.PurchaseItemAllocations}__${ECoreTableName.Locations}`,
  })
  public location: LocationEntity;

  @AutoMap(() => UserEntity)
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({
    name: 'performed_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.PurchaseItemAllocations}__${ECoreTableName.Users}`,
  })
  public performedBy?: UserEntity;
}
