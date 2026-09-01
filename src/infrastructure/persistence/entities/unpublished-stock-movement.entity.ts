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
import { LocationEntity } from './location.entity';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';
import { UnpublishedStockEntity } from './unpublished-stock.entity';

const PK_NAME = 'PK_' + ECoreTableName.UnpublishedStockMovements;

export enum EUnpublishedMovementType {
  StockIn     = 'stock_in',
  StockOut    = 'stock_out',
  TransferOut = 'transfer_out',
}

@Entity({ schema: CORE_SCHEMA, name: ECoreTableName.UnpublishedStockMovements })
export class UnpublishedStockMovementEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: PK_NAME })
  public id: string;

  @AutoMap()
  @Column({ name: 'unpublished_stock_id', type: 'uuid' })
  public unpublishedStockId: string;

  @AutoMap()
  @Column({ name: 'location_id', type: 'uuid' })
  public locationId: string;

  @AutoMap()
  @Column({ name: 'product_id', type: 'uuid' })
  public productId: string;

  @AutoMap()
  @Column({ name: 'performed_by_id', type: 'uuid', nullable: true })
  public performedById?: string;

  @AutoMap(() => String)
  @Column({ name: 'movement_type', type: 'enum', enum: EUnpublishedMovementType })
  public movementType: EUnpublishedMovementType;

  @AutoMap()
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  public quantity: number;

  @AutoMap()
  @Column({ name: 'quantity_before', type: 'decimal', precision: 18, scale: 4 })
  public quantityBefore: number;

  @AutoMap()
  @Column({ name: 'quantity_after', type: 'decimal', precision: 18, scale: 4 })
  public quantityAfter: number;

  @AutoMap()
  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 4, nullable: true })
  public unitCost?: number;

  @AutoMap()
  @Column({ type: 'text', nullable: true })
  public notes?: string;

  @AutoMap(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @AutoMap(() => UnpublishedStockEntity)
  @ManyToOne(() => UnpublishedStockEntity, (us) => us.movements)
  @JoinColumn({
    name: 'unpublished_stock_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.UnpublishedStockMovements}__${ECoreTableName.UnpublishedStock}`,
  })
  public unpublishedStock: UnpublishedStockEntity;

  @AutoMap(() => LocationEntity)
  @ManyToOne(() => LocationEntity)
  @JoinColumn({
    name: 'location_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.UnpublishedStockMovements}__${ECoreTableName.Locations}`,
  })
  public location: LocationEntity;

  @AutoMap(() => ProductEntity)
  @ManyToOne(() => ProductEntity)
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.UnpublishedStockMovements}__${ECoreTableName.Products}`,
  })
  public product: ProductEntity;

  @AutoMap(() => UserEntity)
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({
    name: 'performed_by_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: `FK__${ECoreTableName.UnpublishedStockMovements}__${ECoreTableName.Users}`,
  })
  public performedBy?: UserEntity;
}
