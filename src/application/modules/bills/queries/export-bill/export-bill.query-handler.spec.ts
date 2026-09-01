jest.mock('@automapper/classes', () => ({
  AutoMap: () => () => undefined,
}));

jest.mock('../../../../../common', () => ({
  QueryHandlerStrict: () => () => undefined,
  QueryBase: class QueryBase {},
  PDF_EXPORT_SERVICE: 'PDF_EXPORT_SERVICE',
}));

jest.mock('../../../../constants', () => ({
  BILL_REPO: 'BILL_REPO',
  ORGANIZATION_REPO: 'ORGANIZATION_REPO',
}));

jest.mock('../..', () => ({
  IBillRepo: class IBillRepo {},
}));

jest.mock('../../domain', () => ({
  Bill: class Bill {},
  BillItem: class BillItem {},
}));

import { ExportBillQuery } from './export-bill.query';
import { ExportBillQueryHandler } from './export-bill.query-handler';

describe('ExportBillQueryHandler', () => {
  it('loads organization and passes logo + orgName into PDF context', async () => {
    const bill = {
      id: 'b1',
      billNumber: 'BILL-1',
      organizationId: 'org-1',
      status: 'COMPLETED',
      customerId: null,
      walkInName: 'Walk-in',
      walkInPhone: '999',
      locationId: 'loc-1',
      createdById: 'u1',
      billedAt: new Date('2026-08-01'),
      items: [],
      subtotal: 100,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 100,
      paymentMethod: 'cash',
      notes: '',
    };
    const billRepo = { getAsync: jest.fn().mockResolvedValue(bill) };
    const organizationRepo = {
      getAsync: jest.fn().mockResolvedValue({
        id: 'org-1',
        name: 'Acme Traders',
        email: 'a@acme.test',
        phone: '111',
        country: 'Kenya',
        logoUrl: 'https://cdn.example/logo.png',
      }),
    };
    const pdfService = {
      generateFromTemplateAsync: jest.fn().mockResolvedValue({
        buffer: Buffer.from('pdf'),
        filename: 'bill-BILL-1.pdf',
        contentType: 'application/pdf',
      }),
    };
    const handler = new ExportBillQueryHandler(
      billRepo as any,
      organizationRepo as any,
      pdfService as any,
      { info: jest.fn() } as any,
    );

    await handler.execute(Object.assign(new ExportBillQuery(), { id: 'b1' }));

    expect(organizationRepo.getAsync).toHaveBeenCalledWith('org-1');
    const context = pdfService.generateFromTemplateAsync.mock.calls[0][1];
    expect(context.orgName).toBe('Acme Traders');
    expect(context.logoUrl).toBe('https://cdn.example/logo.png');
    expect(context.orgMeta).toContain('a@acme.test');
    expect(pdfService.generateFromTemplateAsync.mock.calls[0][0]).toBe('bill');
  });

  it('generates a PDF with fallback branding when the organization is missing', async () => {
    const billRepo = {
      getAsync: jest.fn().mockResolvedValue({
        id: 'b1',
        billNumber: 'BILL-1',
        organizationId: 'org-1',
        status: 'COMPLETED',
        customerId: null,
        locationId: 'loc-1',
        createdById: 'u1',
        items: [],
        subtotal: 100,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 100,
      }),
    };
    const organizationRepo = { getAsync: jest.fn().mockResolvedValue(null) };
    const pdfService = {
      generateFromTemplateAsync: jest.fn().mockResolvedValue({
        buffer: Buffer.from('pdf'),
        filename: 'bill-BILL-1.pdf',
        contentType: 'application/pdf',
      }),
    };
    const handler = new ExportBillQueryHandler(
      billRepo as any,
      organizationRepo as any,
      pdfService as any,
      { info: jest.fn() } as any,
    );

    await handler.execute(Object.assign(new ExportBillQuery(), { id: 'b1' }));

    const context = pdfService.generateFromTemplateAsync.mock.calls[0][1];
    expect(context.orgName).toBe('Organization');
    expect(context.logoUrl).toBe('');
    expect(pdfService.generateFromTemplateAsync).toHaveBeenCalledTimes(1);
  });
});
