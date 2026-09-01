import { AutoMap } from '@automapper/classes';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CORE_SCHEMA, ECoreTableName } from './e-core-table-name';
import { UserRoleEntity } from './user-role.entity';

const PK_NAME = 'PK_' + ECoreTableName.Roles;

export enum ERole {
  SuperAdmin   = 'super_admin',
  OrgAdmin     = 'org_admin',
  OrgManager   = 'org_manager',
  StoreManager = 'store_manager',
  StoreStaff   = 'store_staff',
  Picker       = 'picker',
  Driver       = 'driver',
}

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.Roles })
export class RoleEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap(() => String)
  @Column({ type: 'enum', enum: ERole, unique: true })
  public name: ERole;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  public description?: string;

  @AutoMap(() => Date)
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @AutoMap(() => Date)
  @UpdateDateColumn({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  public updatedAt?: Date;

  // ─── Relations ──────────────────────────────────────────────────────────────

  @AutoMap(() => [UserRoleEntity])
  @OneToMany(() => UserRoleEntity, (ur) => ur.role)
  public userRoles?: UserRoleEntity[];
}
