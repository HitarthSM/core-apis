import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class ConfirmDeliveryOtpRequest {
  @ApiProperty() @IsNotEmpty() @IsString() @Length(6, 6) @AutoMap() public otp: string;
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public driverUserId: string;
}
