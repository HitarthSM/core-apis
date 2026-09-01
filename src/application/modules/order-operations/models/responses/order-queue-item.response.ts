import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class OrderQueueItemResponse {
  @ApiProperty() @AutoMap() public id: string;
  @ApiProperty() @AutoMap() public orderNumber: string;
  @ApiProperty() @AutoMap() public customerId: string;
  @ApiProperty() @AutoMap() public locationId: string;
  @ApiProperty() @AutoMap() public status: string;
  @ApiProperty() @AutoMap() public totalAmount: number;
  @ApiProperty() @AutoMap() public createdAt: Date;
}
