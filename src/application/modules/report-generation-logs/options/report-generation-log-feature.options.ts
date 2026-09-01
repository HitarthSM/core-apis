import { EOrder } from '../../../../common';

export class ReportGenerationLogFeatureOptions {
  public page: number;
  public perPage: number;
  public orderBy: string;
  public order: EOrder;

  constructor(page?: number, perPage?: number, orderBy?: string, order?: EOrder) {
    this.page = page ?? 1;
    this.perPage = perPage ?? 20;
    this.orderBy = orderBy ?? 'createdAt';
    this.order = order ?? EOrder.Desc;
  }
}
