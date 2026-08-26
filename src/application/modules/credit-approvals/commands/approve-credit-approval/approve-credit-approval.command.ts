import { CommandBase } from '../../../../../common';

export class ApproveCreditApprovalCommand extends CommandBase {
  public id: string;
  public decidedById: string;
  public organizationId: string;
}
