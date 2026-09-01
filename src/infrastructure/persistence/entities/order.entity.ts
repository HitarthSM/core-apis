import { AutoMap } from '@automapper/classes';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CORE_SCHEMA, ECoreTableName } from './e-core-table-name';
import { LocationEntity } from './location.entity';
import { CustomerEntity } from './customer.entity';
import { OrderItemEntity } from './order-item.entity';

const PK_NAME = 'PK_' + ECoreTableName.Orders;

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.Orders })
export class OrderEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap()
  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  public orderNumber: string;

  @AutoMap()
  @Column({ name: 'location_id', type: 'uuid' })
  public locationId: string;

  @AutoMap()
  @Column({ name: 'customer_id', type: 'uuid' })
  public customerId: string;

  @AutoMap()
  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  public status: string;

  @AutoMap()
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  public subtotal: number;

  @AutoMap()
  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 4, default: 0 })
  public taxAmount: number;

  @AutoMap()
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 4, default: 0 })
  public totalAmount: number;

  @AutoMap()
  @Column({ name: 'payment_status', type: 'varchar', length: 50, default: 'UNPAID' })
  public paymentStatus: string;

  @AutoMap()
  @Column({ name: 'claimed_by_user_id', type: 'uuid', nullable: true })
  public claimedByUserId?: string;

  @AutoMap(() => Date)
  @Column({ name: 'claimed_at', type: 'timestamp', nullable: true })
  public claimedAt?: Date;

  @AutoMap()
  @Column({ name: 'packed_by_user_id', type: 'uuid', nullable: true })
  public packedByUserId?: string;

  @AutoMap(() => Date)
  @Column({ name: 'packed_at', type: 'timestamp', nullable: true })
  public packedAt?: Date;

  @AutoMap(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @AutoMap(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  public updatedAt?: Date;

  @AutoMap(() => Date)
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  public deletedAt?: Date;

  @AutoMap(() => LocationEntity)
  @ManyToOne(() => LocationEntity)
  @JoinColumn({
    name: 'location_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.Orders}__${ECoreTableName.Locations}`,
  })
  public location: LocationEntity;

  @AutoMap(() => CustomerEntity)
  @ManyToOne(() => CustomerEntity)
  @JoinColumn({
    name: 'customer_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.Orders}__${ECoreTableName.Customers}`,
  })
  public customer: CustomerEntity;

  @AutoMap(() => [OrderItemEntity])
  @OneToMany(() => OrderItemEntity, (item) => item.order)
  public items?: OrderItemEntity[];
}
