import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import { CommandHandlerStrict, CLERK_SERVICE, IClerkService } from '../../../../../common';
import { USER_REPO } from '../../../../constants';
import { IUserRepo } from '../../../users';
import { UserEntity, UserRoleEntity, OrgMemberEntity } from '../../../../../infrastructure/persistence/entities';
import { RegisterMobileUserCommand } from './register-mobile-user.command';

@CommandHandlerStrict(RegisterMobileUserCommand)
export class RegisterMobileUserCommandHandler implements ICommandHandler<RegisterMobileUserCommand, string> {
  constructor(
    @Inject(CLERK_SERVICE) private readonly clerkService: IClerkService,
    @Inject(USER_REPO) private readonly userRepo: IUserRepo,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectPinoLogger(RegisterMobileUserCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: RegisterMobileUserCommand): Promise<string> {
    this.logger.info({ email: command.email }, `Executing ${RegisterMobileUserCommand.name}`);

    const clerkUserId = await this.clerkService.createUserAsync({
      email:     command.email,
      password:  command.password,
      firstName: command.firstName,
      lastName:  command.lastName,
    });

    const user = await this.userRepo.upsertByClerkIdAsync(clerkUserId, {
      email:     command.email,
      firstName: command.firstName,
      lastName:  command.lastName,
      isActive:  true,
    });

    await this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(UserEntity, {
        where: { id: user.id },
        lock:  { mode: 'pessimistic_write' },
      });
      if (!locked || locked.organizationId) return;

      locked.organizationId = command.organizationId;
      await manager.save(UserEntity, locked);

      await manager.save(UserRoleEntity, manager.create(UserRoleEntity, {
        userId: user.id,
        roleId: command.roleId,
      }));

      await manager.save(OrgMemberEntity, manager.create(OrgMemberEntity, {
        userId:         user.id,
        organizationId: command.organizationId,
        roleId:         command.roleId,
        status:         'active',
        joinedAt:       new Date(),
      }));
    });

    this.logger.info({ userId: user.id, clerkUserId }, 'Mobile staff user registered via Clerk');
    return user.id;
  }
}
