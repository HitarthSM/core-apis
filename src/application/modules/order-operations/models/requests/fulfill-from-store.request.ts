import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class FulfillFromStoreRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public userId: string;
}
