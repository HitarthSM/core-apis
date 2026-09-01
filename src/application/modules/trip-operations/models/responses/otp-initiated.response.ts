import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class OtpInitiatedResponse {
  @ApiProperty() @AutoMap() public maskedEmail: string;
}
