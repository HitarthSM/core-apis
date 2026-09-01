import { IBaseRepo, Filter, PageableFilter } from '../../../common';
import { EntityManager } from 'typeorm';
import { UnpublishedStock } from './domain';

export interface UnpublishedStockFilter {
  organizationId?: string;
  locationId?: string;
  productId?: string;
}

export const UNPUBLISHED_STOCK_REPO = 'UNPUBLISHED_STOCK_REPO';

export interface IUnpublishedStockRepo extends IBaseRepo<UnpublishedStock, string, PageableFilter<UnpublishedStockFilter>, Filter<UnpublishedStockFilter>> {
  findOrCreateAsync(organizationId: string, locationId: string, productId: string, manager: EntityManager): Promise<UnpublishedStock>;
  findByOrgLocationProductAsync(organizationId: string, locationId: string, productId: string, manager?: EntityManager): Promise<UnpublishedStock | null>;
  addStockAsync(id: string, quantity: number, unitCost: number | undefined, manager: EntityManager): Promise<UnpublishedStock>;
  deductStockAsync(id: string, quantity: number, manager: EntityManager): Promise<UnpublishedStock>;
}
