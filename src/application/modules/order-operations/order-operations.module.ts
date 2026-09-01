import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderOperationsController } from './order-operations.controller';
import { OrderOperationCommandHandlers } from './commands';
import { OrderOperationQueryHandlers } from './queries';

@Module({
  imports: [CqrsModule],
  controllers: [OrderOperationsController],
  providers: [
    ...OrderOperationCommandHandlers,
    ...OrderOperationQueryHandlers,
  ],
})
export class OrderOperationsModule {}
