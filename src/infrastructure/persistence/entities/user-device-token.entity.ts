import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CORE_SCHEMA, ECoreTableName } from './e-core-table-name';

const PK_NAME = 'PK_' + ECoreTableName.UserDeviceTokens;

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.UserDeviceTokens })
@Unique('UQ__user_device_tokens__user_token', ['userId', 'token'])
export class UserDeviceTokenEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap()
  @Column({ name: 'user_id', type: 'uuid' })
  public userId: string;

  @AutoMap()
  @Column({ type: 'varchar', length: 500 })
  public token: string;

  @AutoMap()
  @Column({ type: 'varchar', length: 10 })
  public platform: string;

  @AutoMap(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @AutoMap(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  public updatedAt?: Date;
}
