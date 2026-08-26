import { AutoMap } from '@automapper/classes';
import { QueryBase } from '../../../../../common';

export class DownloadReportPdfQuery extends QueryBase {
  @AutoMap() public id: string;
}
