import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CORE_SCHEMA, ECoreTableName } from './e-core-table-name';
import { TripEntity } from './trip.entity';
import { OrderEntity } from './order.entity';
import { ETripStopStatus } from '../../../application/shared/enums/e-trip-stop-status';

const PK_NAME = 'PK_' + ECoreTableName.TripStops;

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.TripStops })
export class TripStopEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap()
  @Column({ name: 'trip_id', type: 'uuid' })
  public tripId: string;

  @AutoMap()
  @Column({ name: 'order_id', type: 'uuid' })
  public orderId: string;

  @AutoMap()
  @Column({ type: 'integer' })
  public sequence: number;

  @AutoMap(() => String)
  @Column({ type: 'enum', enum: ETripStopStatus, default: ETripStopStatus.Pending })
  public status: ETripStopStatus;

  @AutoMap()
  @Column({ name: 'otp_code', type: 'varchar', length: 60, nullable: true })
  public otpCode?: string;

  @AutoMap(() => Date)
  @Column({ name: 'otp_expires_at', type: 'timestamp', nullable: true })
  public otpExpiresAt?: Date;

  @AutoMap(() => Date)
  @Column({ name: 'otp_verified_at', type: 'timestamp', nullable: true })
  public otpVerifiedAt?: Date;

  @AutoMap(() => Date)
  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  public deliveredAt?: Date;

  @AutoMap(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @AutoMap(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  public updatedAt?: Date;

  @AutoMap(() => TripEntity)
  @ManyToOne(() => TripEntity)
  @JoinColumn({
    name: 'trip_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.TripStops}__${ECoreTableName.Trips}`,
  })
  public trip: TripEntity;

  @AutoMap(() => OrderEntity)
  @ManyToOne(() => OrderEntity)
  @JoinColumn({
    name: 'order_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.TripStops}__${ECoreTableName.Orders}`,
  })
  public order: OrderEntity;
}
