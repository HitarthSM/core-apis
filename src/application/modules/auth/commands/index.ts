import { SyncUserCommandHandler } from './sync-user';
import { OnboardOrganizationCommandHandler } from './onboard-organization';
import { RegisterMobileUserCommandHandler } from './register-mobile-user';

export * from './sync-user';
export * from './onboard-organization';
export * from './register-mobile-user';

export const AuthCommandHandlers = [
  SyncUserCommandHandler,
  OnboardOrganizationCommandHandler,
  RegisterMobileUserCommandHandler,
];
