import { Inject } from '@nestjs/common';
import type { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  IPdfExportService,
  PDF_EXPORT_SERVICE,
  PdfDocument,
  QueryHandlerStrict,
} from '../../../../../common';
import {
  BILL_REPO,
  CUSTOMER_CREDIT_TRANSACTION_REPO,
  CUSTOMER_REPO,
  ORGANIZATION_REPO,
} from '../../../../constants';
import { IBillRepo } from '../../../bills/i-bill.repo';
import { Bill } from '../../../bills/domain';
import { CustomerCreditTransaction } from '../../../credit-approvals/domain';
import { ICustomerCreditTransactionRepo } from '../../../credit-approvals/i-customer-credit-transaction.repo';
import { IOrganizationRepo } from '../../../organizations/i-organization.repo';
import { EBillStatus, ECreditTransactionType, ESaleType } from '../../../../../infrastructure/persistence/entities';
import { ICustomerRepo } from '../..';
import { ExportCustomerStatementQuery } from './export-customer-statement.query';

type StatementRow =
  | { kind: 'receipt'; date: string; receiptNumber: string; amount: number }
  | { kind: 'payment'; date: string; amount: number; method: string };

type LedgerRow = {
  date: string;
  invNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  alt: boolean;
};

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

@QueryHandlerStrict(ExportCustomerStatementQuery)
export class ExportCustomerStatementQueryHandler
  implements IQueryHandler<ExportCustomerStatementQuery, PdfDocument>
{
  constructor(
    @Inject(CUSTOMER_REPO) private readonly customerRepo: ICustomerRepo,
    @Inject(ORGANIZATION_REPO) private readonly organizationRepo: IOrganizationRepo,
    @Inject(BILL_REPO) private readonly billRepo: IBillRepo,
    @Inject(CUSTOMER_CREDIT_TRANSACTION_REPO)
    private readonly creditTxRepo: ICustomerCreditTransactionRepo,
    @Inject(PDF_EXPORT_SERVICE) private readonly pdfService: IPdfExportService,
    @InjectPinoLogger(ExportCustomerStatementQueryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: ExportCustomerStatementQuery): Promise<PdfDocument> {
    this.logger.info(`Executing ${ExportCustomerStatementQuery.name} customerId=${query.customerId}`);

    const customer = await this.customerRepo.getAsync(query.customerId);
    const organization = await this.organizationRepo.getAsync(customer.organizationId);

    const [billsPage, txPage] = await Promise.all([
      this.billRepo.pagedAsync({
        customerId: customer.id,
        organizationId: customer.organizationId,
        saleType: ESaleType.Credit,
        $orderBy: 'createdAt',
        $order: 'ASC',
        $page: 1,
        $perPage: 500,
      } as any),
      this.creditTxRepo.pagedAsync({
        customerId: customer.id,
        $orderBy: 'createdAt',
        $order: 'ASC',
        $page: 1,
        $perPage: 500,
      } as any),
    ]);

    const currentOwed = Number(customer.creditBalance ?? 0);
    const ledger = this.withRunningBalance(
      this.buildStatement(billsPage.items ?? [], txPage.items ?? []),
      currentOwed,
    );

    const first = ledger[0]?.date;
    const last = ledger[ledger.length - 1]?.date;
    const statementRange =
      first && last ? `${this.fmtDate(first)} to ${this.fmtDate(last)}` : this.fmtDate(new Date().toISOString());
    const asOn = last ? this.fmtDate(last) : this.fmtDate(new Date().toISOString());

    const orgMeta = [organization.email, organization.phone, organization.country]
      .filter(Boolean)
      .join(' · ');

    const context = {
      orgName: organization.name ?? 'Organization',
      orgPhone: organization.phone ?? '',
      orgAddress: organization.country ?? '',
      orgMeta,
      logoUrl: organization.logoUrl ?? '',
      customerName: customer.name || 'Unnamed',
      customerAddress: customer.address ?? '',
      pinCode: customer.pinCode ?? '',
      shopName: customer.shopName ?? '',
      statementRange,
      asOn,
      currentBalance: this.money(currentOwed) || '0.00',
      balanceInWords: this.amountInWords(currentOwed),
      rows: ledger.map((row, i) => ({
        ...row,
        date: this.fmtDate(row.date),
        invNo: row.invNo || '—',
        debit: this.money(row.debit),
        credit: this.money(row.credit),
        balance: this.money(row.balance) || '0.00',
        alt: i % 2 === 1,
      })),
    };

    const safeName = (customer.name || customer.id).replace(/[^\w.-]+/g, '_');
    return this.pdfService.generateFromTemplateAsync(
      'creditor-statement',
      context,
      `statement-${safeName}.pdf`,
    );
  }

  private buildStatement(bills: Bill[], transactions: CustomerCreditTransaction[]): StatementRow[] {
    const receipts: StatementRow[] = bills
      .filter((b) => b.saleType === ESaleType.Credit && b.status === EBillStatus.Completed)
      .map((b) => ({
        kind: 'receipt' as const,
        date: this.toIso(b.billedAt ?? b.createdAt),
        receiptNumber: b.billNumber || b.id,
        amount: Number(b.totalAmount ?? 0),
      }));

    const payments: StatementRow[] = transactions
      .filter((t) => t.type === ECreditTransactionType.Payment)
      .map((t) => ({
        kind: 'payment' as const,
        date: this.toIso(t.createdAt),
        amount: Number(t.amount ?? 0),
        method: t.paymentMethod ?? 'other',
      }));

    return [...receipts, ...payments].sort((a, b) => a.date.localeCompare(b.date));
  }

  private withRunningBalance(rows: StatementRow[], currentOwed: number): LedgerRow[] {
    const net = rows.reduce((sum, row) => sum + (row.kind === 'receipt' ? row.amount : -row.amount), 0);
    let running = currentOwed - net;
    return rows.map((row, i) => {
      const debit = row.kind === 'receipt' ? row.amount : 0;
      const credit = row.kind === 'payment' ? row.amount : 0;
      running += debit - credit;
      return {
        date: row.date,
        invNo: row.kind === 'receipt' ? row.receiptNumber : '',
        description: row.kind === 'receipt' ? 'Credit sale' : this.paymentDescription(row.method),
        debit,
        credit,
        balance: running,
        alt: i % 2 === 1,
      };
    });
  }

  private paymentDescription(method: string): string {
    if (method === 'bank_transfer') return 'Bank Payment';
    if (method === 'cash') return 'Cash Payment';
    return 'Payment';
  }

  private toIso(value?: Date | string): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }

  private fmtDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString();
  }

  private money(n: number): string {
    if (!n) return '';
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private underThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ONES[n];
    if (n < 100) {
      const ones = n % 10;
      const tens = TENS[Math.floor(n / 10)];
      return ones ? `${tens}-${ONES[ones]}` : tens;
    }
    const rest = n % 100;
    const hundred = `${ONES[Math.floor(n / 100)]} Hundred`;
    return rest ? `${hundred} ${this.underThousand(rest)}` : hundred;
  }

  private amountInWords(n: number): string {
    const value = Math.round(Math.abs(n));
    if (value === 0) return 'Zero Only';
    const million = Math.floor(value / 1_000_000);
    const thousand = Math.floor((value % 1_000_000) / 1_000);
    const rest = value % 1_000;
    const parts: string[] = [];
    if (million) parts.push(`${this.underThousand(million)} Million`);
    if (thousand) parts.push(`${this.underThousand(thousand)} Thousand`);
    if (rest) parts.push(this.underThousand(rest));
    return `${parts.join(' ')} Only`;
  }
}
