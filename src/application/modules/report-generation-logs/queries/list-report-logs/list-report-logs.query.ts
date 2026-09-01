import { AutoMap } from '@automapper/classes';
import { EOrder, Filter, QueryBase } from '../../../../../common';
import { ReportGenerationLogFilter } from '../../domain';

export class ListReportLogsQuery extends QueryBase implements Filter<ReportGenerationLogFilter> {
  @AutoMap() public orgId?: string;
  @AutoMap() public reportType?: string;
  @AutoMap() public reportPeriod?: string;
  @AutoMap() public status?: string;
  @AutoMap() public reportName?: string;
  /** Generic client search alias — normalizer maps to reportName. */
  @AutoMap() public name?: string;

  @AutoMap() public $orderBy?: string;
  @AutoMap(() => String) public $order?: EOrder;
}
