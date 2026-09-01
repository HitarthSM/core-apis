import { QueryBase } from '../../../../../common';

export class GetDevTokenQuery extends QueryBase {
  public email: string;
  public password: string;
}
