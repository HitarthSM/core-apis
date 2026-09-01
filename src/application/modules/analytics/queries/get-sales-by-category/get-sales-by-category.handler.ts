import { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryHandlerStrict } from 'src/common';
import { GetSalesByCategoryQuery } from './get-sales-by-category.query';
import { CategoryValuePointResponse } from '../../models';

interface RawRow {
  categoryId: string | null;
  categoryName: string;
  value: string;
}

const SQL = `
  SELECT
    c.id AS "categoryId",
    COALESCE(c.name, 'Uncategorized') AS "categoryName",
    COALESCE(SUM(bi.line_total), 0) AS value
  FROM core.bill_items bi
  JOIN core.bills b ON b.id = bi.bill_id
  JOIN core.products p ON p.id = bi.product_id
  LEFT JOIN core.categories c ON c.id = p.category_id
  WHERE b.organization_id = $1
    AND b.status = 'COMPLETED'
    AND b.deleted_at IS NULL
    AND b.created_at >= $2
    AND b.created_at <= $3
    AND ($4::uuid IS NULL OR b.location_id = $4)
  GROUP BY c.id, c.name
  HAVING COALESCE(SUM(bi.line_total), 0) > 0
  ORDER BY value DESC
`;

@QueryHandlerStrict(GetSalesByCategoryQuery)
export class GetSalesByCategoryHandler
  implements IQueryHandler<GetSalesByCategoryQuery, CategoryValuePointResponse[]>
{
  public constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectPinoLogger(GetSalesByCategoryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: GetSalesByCategoryQuery): Promise<CategoryValuePointResponse[]> {
    this.logger.info(`Executing Query '${GetSalesByCategoryQuery.name}'`);
    const rows = await this.dataSource.query<RawRow[]>(SQL, [
      query.organizationId,
      query.from,
      query.to,
      query.locationId ?? null,
    ]);
    return rows.map((row) => ({
      categoryId: row.categoryId ?? undefined,
      categoryName: row.categoryName,
      value: Number(row.value),
    }));
  }
}
