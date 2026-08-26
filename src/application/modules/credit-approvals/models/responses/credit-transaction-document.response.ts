import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreditTransactionDocumentType } from '../../domain';

export class CreditTransactionDocumentResponse {
  @ApiProperty() public id: string;
  @ApiProperty() public customerId: string;
  @ApiPropertyOptional({ nullable: true }) public customerName: string | null;
  @ApiPropertyOptional({ nullable: true }) public billId: string | null;
  @ApiPropertyOptional({ nullable: true }) public billNumber: string | null;
  @ApiPropertyOptional({ nullable: true }) public walkInName: string | null;
  @ApiProperty({ enum: ['credit_sale', 'payment', 'adjustment'] }) public type: CreditTransactionDocumentType;
  @ApiProperty() public amount: number;
  @ApiProperty() public balanceBefore: number;
  @ApiProperty() public balanceAfter: number;
  @ApiPropertyOptional({ nullable: true }) public paymentMethod: string | null;
  @ApiPropertyOptional({ nullable: true }) public note: string | null;
  @ApiPropertyOptional({ nullable: true }) public subtotal: number | null;
  @ApiPropertyOptional({ nullable: true }) public discountAmount: number | null;
  @ApiPropertyOptional({ nullable: true }) public taxAmount: number | null;
  @ApiPropertyOptional({ nullable: true }) public totalAmount: number | null;
  @ApiPropertyOptional({ nullable: true }) public billedAt: Date | null;
  @ApiProperty() public createdAt: Date;
}

export class CreditTransactionsDocumentsPagedResponse {
  @ApiProperty({ type: [CreditTransactionDocumentResponse] }) public items: CreditTransactionDocumentResponse[];
  @ApiProperty() public page: number;
  @ApiProperty() public perPage: number;
  @ApiProperty() public totalCount: number;
  @ApiProperty() public totalPages: number;
}
