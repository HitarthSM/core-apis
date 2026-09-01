import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class RegisterMobileUserRequest {
  @ApiProperty() @IsNotEmpty() @IsString() @AutoMap() public firstName: string;
  @ApiProperty() @IsNotEmpty() @IsString() @AutoMap() public lastName: string;
  @ApiProperty() @IsEmail() @AutoMap() public email: string;
  @ApiProperty() @IsNotEmpty() @IsString() @MinLength(8) @AutoMap() public password: string;
  @ApiProperty() @IsUUID() @AutoMap() public organizationId: string;
  @ApiProperty() @IsUUID() @AutoMap() public roleId: string;
}
