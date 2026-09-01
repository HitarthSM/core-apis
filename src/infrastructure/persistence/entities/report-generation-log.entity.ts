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
import { EReportPeriod } from '../../../application/modules/report-generation-logs/domain/e-report-period';
import { EReportType } from '../../../application/modules/report-generation-logs/domain/e-report-type';

const PK_NAME = 'PK_' + ECoreTableName.ReportGenerationLogs;

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.ReportGenerationLogs })
export class ReportGenerationLogEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap()
  @Column({ name: 'org_id', type: 'uuid' })
  public orgId: string;

  @AutoMap(() => String)
  @Column({ name: 'report_type', type: 'varchar', length: 100 })
  public reportType: EReportType;

  @AutoMap(() => String)
  @Column({ name: 'report_period', type: 'varchar', length: 50, nullable: true })
  public reportPeriod: EReportPeriod;

  @AutoMap()
  @Column({ name: 'report_name', type: 'varchar', length: 500, nullable: true })
  public reportName: string;

  @AutoMap(() => Date)
  @Column({ name: 'from_date', type: 'timestamp', nullable: true })
  public fromDate: Date;

  @AutoMap(() => Date)
  @Column({ name: 'to_date', type: 'timestamp', nullable: true })
  public toDate: Date;

  @AutoMap()
  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  public locationId?: string;

  @AutoMap()
  @Column({ name: 'generated_by_id', type: 'uuid', nullable: true })
  public generatedById?: string;

  @AutoMap()
  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  public status: string;

  @AutoMap()
  @Column({ name: 'file_url', type: 'varchar', length: 255, nullable: true })
  public fileUrl?: string;

  @AutoMap()
  @Column({ name: 'error_message', type: 'text', nullable: true })
  public errorMessage?: string;

  @AutoMap()
  @Column({ name: 'report_data', type: 'jsonb', nullable: true })
  public reportData?: Record<string, unknown>;

  @AutoMap(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  // ─── Relations ──────────────────────────────────────────────────────────────

  @AutoMap(() => OrganizationEntity)
  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({
    name: 'org_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.ReportGenerationLogs}__${ECoreTableName.Organizations}`,
  })
  public organization: OrganizationEntity;
}
