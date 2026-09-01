import { GetMeQueryHandler } from './get-me';
import { GetTokenQueryHandler } from './get-token';
import { GetDevTokenQueryHandler } from './get-dev-token';

export * from './get-me';
export * from './get-token';
export * from './get-dev-token';

export const AuthQueryHandlers = [GetMeQueryHandler, GetTokenQueryHandler, GetDevTokenQueryHandler];
