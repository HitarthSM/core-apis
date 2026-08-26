export type CreditTransactionDocumentType = 'credit_sale' | 'payment' | 'adjustment';

export interface CreditTransactionDocument {
  id: string;
  customerId: string;
  customerName: string | null;
  billId: string | null;
  billNumber: string | null;
  walkInName: string | null;
  type: CreditTransactionDocumentType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  paymentMethod: string | null;
  note: string | null;
  subtotal: number | null;
  discountAmount: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  billedAt: Date | null;
  createdAt: Date;
}

export type SearchCreditTransactionsFilter = {
  organizationId: string;
  type?: CreditTransactionDocumentType;
  customerId?: string;
  search?: string;
  $page: number;
  $perPage: number;
};
