import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class MobileLoginRequest {
  @ApiProperty() @IsEmail() @AutoMap() public email: string;
  @ApiProperty() @IsNotEmpty() @IsString() @AutoMap() public password: string;
}
