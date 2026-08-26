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
import { OrganizationEntity } from './organization.entity';

const PK_NAME = 'PK_' + ECoreTableName.PaymentTransactions;

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.PaymentTransactions })
export class PaymentTransactionEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap()
  @Column({ name: 'org_id', type: 'uuid' })
  public orgId: string;

  @AutoMap()
  @Column({ name: 'reference_id', type: 'uuid' })
  public referenceId: string;

  @AutoMap()
  @Column({ name: 'reference_type', type: 'varchar', length: 50 })
  public referenceType: string;

  @AutoMap()
  @Column({ type: 'varchar', length: 50 })
  public type: string;

  @AutoMap()
  @Column({ type: 'varchar', length: 50 })
  public method: string;

  @AutoMap()
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  public amount: number;

  @AutoMap()
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  public status: string;

  @AutoMap(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  // ─── Relations ──────────────────────────────────────────────────────────────

  @AutoMap(() => OrganizationEntity)
  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({
    name: 'org_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.PaymentTransactions}__${ECoreTableName.Organizations}`,
  })
  public organization: OrganizationEntity;
}
