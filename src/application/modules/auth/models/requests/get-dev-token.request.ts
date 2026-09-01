import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class GetDevTokenRequest {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  public email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  public password: string;
}
