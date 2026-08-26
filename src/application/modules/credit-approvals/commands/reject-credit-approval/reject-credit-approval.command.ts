import { CommandBase } from '../../../../../common';

export class RejectCreditApprovalCommand extends CommandBase {
  public id: string;
  public decidedById: string;
  public organizationId: string;
}
