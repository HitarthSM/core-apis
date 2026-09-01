import { AutoMap } from '@automapper/classes';
import {
  EBillStatus,
  ECustomerType,
  EPaymentMethod,
  EPaymentTiming,
  ESaleType,
} from '../../../../infrastructure/persistence/entities';
import { Customer } from '../../customers/domain';
import { BillItem } from './bill-item.model';

export class Bill {
  @AutoMap() public id: string;
  @AutoMap() public billNumber: string;
  @AutoMap() public organizationId: string;
  @AutoMap() public locationId: string;
  @AutoMap() public customerId?: string;
  @AutoMap(() => Customer) public customer?: Customer;
  @AutoMap() public createdById?: string;
  @AutoMap() public sourceOrderId?: string;
  @AutoMap() public walkInName?: string;
  @AutoMap() public walkInPhone?: string;
  @AutoMap() public walkInGstin?: string;
  @AutoMap(() => String) public status: EBillStatus;
  @AutoMap(() => String) public paymentMethod?: EPaymentMethod;
  @AutoMap(() => String) public saleType: ESaleType;
  @AutoMap(() => String) public customerType?: ECustomerType;
  @AutoMap(() => String) public paymentTiming?: EPaymentTiming;
  @AutoMap() public partialAmount?: number;
  @AutoMap() public blackAmount: number;
  @AutoMap() public facilitatorUserId?: string;
  @AutoMap() public facilitatorName?: string;
  @AutoMap() public commissionAmount: number;
  @AutoMap() public subtotal: number;
  @AutoMap() public taxAmount: number;
  @AutoMap() public discountAmount: number;
  @AutoMap() public totalAmount: number;
  @AutoMap() public notes?: string;
  @AutoMap(() => Date) public billedAt?: Date;
  @AutoMap(() => Date) public createdAt: Date;
  @AutoMap(() => Date) public updatedAt?: Date;
  @AutoMap(() => Date) public deletedAt?: Date;
  @AutoMap(() => [BillItem]) public items?: BillItem[];
}
