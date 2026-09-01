import { IBaseRepo } from '../../../../common';
import { UserDeviceToken } from '../domain/user-device-token.model';

export interface IUserDeviceTokenRepo extends IBaseRepo<UserDeviceToken, string> {
  upsertAsync(userId: string, token: string, platform: string): Promise<void>;
}
