import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CORE_SCHEMA, ECoreTableName } from './e-core-table-name';
import { ECustomerType } from './e-customer-type';
import { numericTransformer } from './numeric.transformer';
import { OrganizationEntity } from './organization.entity';
import { LocationEntity } from './location.entity';
import { CustomerEntity } from './customer.entity';
import { UserEntity } from './user.entity';
import { BillItemEntity } from './bill-item.entity';

const PK_NAME = 'PK_' + ECoreTableName.Bills;

/** Checkout bill lifecycle. INITIATED -> DRAFT (held) -> COMPLETED | CANCELLED. */
export enum EBillStatus {
  Initiated = 'INITIATED',
  Draft     = 'DRAFT',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export enum EPaymentMethod {
  Cash       = 'CASH',
  Card       = 'CARD',
  Upi        = 'UPI',
  NetBanking = 'NET_BANKING',
  Cheque     = 'CHEQUE',
  Credit     = 'CREDIT',
}

export enum ESaleType {
  Normal = 'normal',
  Credit = 'credit',
  Black  = 'black',
}

export enum EPaymentTiming {
  BeforeDelivery = 'before_delivery',
  AfterDelivery  = 'after_delivery',
  Half           = 'half',
  Cod            = 'cod',
}

@Index(`IX__${ECoreTableName.Bills}__org_location_status`, ['organizationId', 'locationId', 'status'])
@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.Bills })
export class BillEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  /** Human-readable bill number e.g. BILL-20260809-1a2b3c4d */
  @AutoMap()
  @Column({ name: 'bill_number', type: 'varchar', length: 50, unique: true })
  public billNumber: string;

  @AutoMap()
  @Column({ name: 'organization_id', type: 'uuid' })
  public organizationId: string;

  @AutoMap()
  @Column({ name: 'location_id', type: 'uuid' })
  public locationId: string;

  /** Registered customer; null for walk-ins. */
  @AutoMap()
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  public customerId?: string;

  @AutoMap()
  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  public createdById?: string;

  /** Link to the sales order that auto-created this bill, if any. */
  @AutoMap()
  @Column({ name: 'source_order_id', type: 'uuid', nullable: true })
  public sourceOrderId?: string;

  @AutoMap()
  @Column({ name: 'walk_in_name', type: 'varchar', length: 255, nullable: true })
  public walkInName?: string;

  @AutoMap()
  @Column({ name: 'walk_in_phone', type: 'varchar', length: 30, nullable: true })
  public walkInPhone?: string;

  @AutoMap()
  @Column({ name: 'walk_in_gstin', type: 'varchar', length: 20, nullable: true })
  public walkInGstin?: string;

  @AutoMap(() => String)
  @Column({ type: 'enum', enum: EBillStatus, default: EBillStatus.Initiated })
  public status: EBillStatus;

  @AutoMap(() => String)
  @Column({ name: 'payment_method', type: 'enum', enum: EPaymentMethod, nullable: true })
  public paymentMethod?: EPaymentMethod;

  @AutoMap(() => String)
  @Column({ name: 'sale_type', type: 'enum', enum: ESaleType, default: ESaleType.Normal })
  public saleType: ESaleType;

  @AutoMap(() => String)
  @Column({ name: 'customer_type', type: 'enum', enum: ECustomerType, nullable: true })
  public customerType?: ECustomerType;

  @AutoMap(() => String)
  @Column({ name: 'payment_timing', type: 'enum', enum: EPaymentTiming, nullable: true })
  public paymentTiming?: EPaymentTiming;

  @AutoMap()
  @Column({ name: 'partial_amount', type: 'decimal', precision: 18, scale: 4, nullable: true, transformer: numericTransformer })
  public partialAmount?: number;

  @AutoMap()
  @Column({ name: 'black_amount', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: numericTransformer })
  public blackAmount: number;

  @AutoMap()
  @Column({ name: 'facilitator_user_id', type: 'uuid', nullable: true })
  public facilitatorUserId?: string;

  @AutoMap()
  @Column({ name: 'facilitator_name', type: 'varchar', length: 255, nullable: true })
  public facilitatorName?: string;

  @AutoMap()
  @Column({ name: 'commission_amount', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: numericTransformer })
  public commissionAmount: number;

  /** Sum of quantity x unitPrice across items, before discount and tax. */
  @AutoMap()
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0, transformer: numericTransformer })
  public subtotal: number;

  @AutoMap()
  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: numericTransformer })
  public taxAmount: number;

  @AutoMap()
  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: numericTransformer })
  public discountAmount: number;

  @AutoMap()
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: numericTransformer })
  public totalAmount: number;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  public notes?: string;

  /** Set when the bill transitions to COMPLETED. */
  @AutoMap(() => Date)
  @Column({ name: 'billed_at', type: 'timestamp', nullable: true })
  public billedAt?: Date;

  @AutoMap(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @AutoMap(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  public updatedAt?: Date;

  @AutoMap(() => Date)
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  public deletedAt?: Date;

  // ─── Relations ────────────────────────────────────────────────────────────────

  @AutoMap(() => OrganizationEntity)
  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.Bills}__${ECoreTableName.Organizations}`,
  })
  public organization: OrganizationEntity;

  @AutoMap(() => LocationEntity)
  @ManyToOne(() => LocationEntity)
  @JoinColumn({
    name: 'location_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.Bills}__${ECoreTableName.Locations}`,
  })
  public location: LocationEntity;

  @AutoMap(() => CustomerEntity)
  @ManyToOne(() => CustomerEntity, { nullable: true })
  @JoinColumn({
    name: 'customer_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.Bills}__${ECoreTableName.Customers}`,
  })
  public customer?: CustomerEntity;

  @AutoMap(() => UserEntity)
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.Bills}__${ECoreTableName.Users}`,
  })
  public createdBy?: UserEntity;

  @AutoMap(() => [BillItemEntity])
  @OneToMany(() => BillItemEntity, (item) => item.bill, { cascade: true })
  public items?: BillItemEntity[];
}
