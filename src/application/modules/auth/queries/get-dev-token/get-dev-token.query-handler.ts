import { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ClerkService, QueryHandlerStrict } from '../../../../../common';
import { GetDevTokenQuery } from './get-dev-token.query';

@QueryHandlerStrict(GetDevTokenQuery)
export class GetDevTokenQueryHandler implements IQueryHandler<GetDevTokenQuery, string> {
  constructor(
    private readonly clerkService: ClerkService,
    @InjectPinoLogger(GetDevTokenQueryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: GetDevTokenQuery): Promise<string> {
    this.logger.info(`Minting dev token for ${query.email}`);
    return this.clerkService.signInWithEmailPasswordAsync(query.email, query.password);
  }
}
