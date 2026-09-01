import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { BaseRepo, DbException, Filter, PageableFilter } from '../../../common';
import { UserDeviceTokenEntity } from '../entities';
import { UserDeviceToken } from '../../../application/modules/notifications/domain/user-device-token.model';
import { IUserDeviceTokenRepo } from '../../../application/modules/notifications/repositories/i-user-device-token.repo';

@Injectable()
export class UserDeviceTokenRepo
  extends BaseRepo<UserDeviceTokenEntity, UserDeviceToken, string, PageableFilter<UserDeviceToken>, Filter<UserDeviceToken>>
  implements IUserDeviceTokenRepo
{
  public constructor(
    @InjectRepository(UserDeviceTokenEntity) internalRepo: Repository<UserDeviceTokenEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(UserDeviceTokenRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, UserDeviceTokenEntity, UserDeviceToken);
  }

  public override get idColumnName(): keyof UserDeviceTokenEntity {
    return 'id';
  }

  public async upsertAsync(userId: string, token: string, platform: string): Promise<void> {
    try {
      const existing = await this.internalRepo.findOne({ where: { userId, token } });
      if (existing) {
        await this.internalRepo.update(existing.id, { platform });
      } else {
        const newToken = this.internalRepo.create({ userId, token, platform });
        await this.internalRepo.save(newToken);
      }
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }
}
