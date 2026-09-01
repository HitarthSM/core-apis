import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreditTransactionDocumentType } from '../../domain';

const CREDIT_TRANSACTION_DOCUMENT_TYPES: CreditTransactionDocumentType[] = ['credit_sale', 'payment', 'adjustment'];

export class SearchCreditTransactionsRequest {
  @ApiPropertyOptional({ enum: CREDIT_TRANSACTION_DOCUMENT_TYPES })
  @IsOptional()
  @IsIn(CREDIT_TRANSACTION_DOCUMENT_TYPES)
  public type?: CreditTransactionDocumentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public $page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public $perPage?: number;
}
