import { AutoMap } from '@automapper/classes';
import { EProductUnit } from '../../../../infrastructure';

export class Product {
  @AutoMap()
  public id: string;

  @AutoMap()
  public organizationId?: string;

  @AutoMap()
  public categoryId?: string;

  @AutoMap()
  public createdById?: string;

  @AutoMap()
  public name?: string;

  @AutoMap()
  public sku?: string;

  @AutoMap()
  public barcode?: string;

  @AutoMap()
  public description?: string;

  @AutoMap(() => String)
  public unit?: EProductUnit;

  @AutoMap()
  public costPrice?: number;

  @AutoMap()
  public retailPrice?: number;

  @AutoMap()
  public loyaltyPrice?: number;

  @AutoMap()
  public wholesalePrice?: number;

  @AutoMap()
  public transferPrice?: number;

  @AutoMap()
  public reorderPoint?: number;

  @AutoMap()
  public manufacturer?: string;

  @AutoMap()
  public packSize?: number;

  @AutoMap()
  public isActive?: boolean;

  @AutoMap(() => Date)
  public createdAt?: Date;

  @AutoMap(() => Date)
  public updatedAt?: Date;
}
