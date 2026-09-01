import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ETripStatus } from '../../../../shared/enums/e-trip-status';

export class UpdateTripStatusRequest {
  @ApiProperty({ enum: ETripStatus }) @IsNotEmpty() @IsEnum(ETripStatus) @AutoMap(() => String) public status: ETripStatus;
}
