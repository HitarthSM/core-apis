import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  AuthenticatedUser,
  ClerkAuthGuard,
  CqrsMediator,
  CurrentUser,
  Roles,
  RolesGuard,
  requireOrganizationId,
} from '../../../common';
import { ERole } from '../../../infrastructure';
import { Trip } from '../trips/domain';
import {
  CreateMultiStopTripCommand,
  UpdateTripStatusCommand,
  UpdateDriverLocationCommand,
  InitiateDeliveryOtpCommand,
  InitiateDeliveryOtpResult,
  ConfirmDeliveryOtpCommand,
  ResendDeliveryOtpCommand,
  ResendDeliveryOtpResult,
} from './commands';
import {
  GetDriverTripsTodayQuery,
  DriverTripItem,
  GetFleetLiveLocationsQuery,
  FleetLiveLocation,
} from './queries';
import {
  CreateMultiStopTripRequest,
  UpdateTripStatusRequest,
  UpdateDriverLocationRequest,
  InitiateDeliveryOtpRequest,
  ConfirmDeliveryOtpRequest,
} from './models/requests';
import { DriverTripResponse, FleetLiveLocationResponse, OtpInitiatedResponse } from './models/responses';

@ApiBearerAuth()
@ApiTags('Trip Operations')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Controller({ path: 'field-ops', version: '1' })
export class TripOperationsController {
  public constructor(
    protected readonly mediator: CqrsMediator,
    @InjectPinoLogger(TripOperationsController.name) protected readonly logger: PinoLogger,
  ) {}

  @ApiOperation({ summary: 'Create a multi-stop delivery trip' })
  @ApiOkResponse({ type: Boolean })
  @Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @Post('trips')
  public async createMultiStopTrip(
    @Body() body: CreateMultiStopTripRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    const organizationId = requireOrganizationId(user);
    const command = new CreateMultiStopTripCommand();
    command.driverId = body.driverId;
    command.vehicleId = body.vehicleId;
    command.organizationId = organizationId;
    command.stops = body.stops;
    await this.mediator.execute<CreateMultiStopTripCommand, Trip>(command);
    return true;
  }

  @ApiOperation({ summary: 'Get trips assigned to driver for today' })
  @ApiOkResponse({ type: [DriverTripResponse] })
  @Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin, ERole.StoreManager, ERole.StoreStaff)
  @HttpCode(HttpStatus.OK)
  @Get('driver/trips/today')
  public async getDriverTripsToday(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DriverTripResponse[]> {
    const organizationId = requireOrganizationId(user);
    const query = new GetDriverTripsTodayQuery();
    query.driverId = user.dbUserId ?? '';
    query.organizationId = organizationId;
    const items = await this.mediator.execute<GetDriverTripsTodayQuery, DriverTripItem[]>(query);
    return items.map((item) => ({
      id: item.id,
      tripNumber: item.tripNumber,
      tripStatus: item.tripStatus,
      startDatetime: item.startDatetime,
      stopCount: item.stopCount,
    }));
  }

  @ApiOperation({ summary: 'Update trip status' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'id', description: 'Trip UUID' })
  @Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin, ERole.StoreManager, ERole.StoreStaff)
  @HttpCode(HttpStatus.OK)
  @Patch('trips/:id/status')
  public async updateTripStatus(
    @Param('id') id: string,
    @Body() body: UpdateTripStatusRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    const command = new UpdateTripStatusCommand();
    command.tripId = id;
    command.driverId = user.dbUserId ?? '';
    command.status = body.status;
    await this.mediator.execute<UpdateTripStatusCommand, Trip>(command);
    return true;
  }

  @ApiOperation({ summary: 'Update driver live location' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'id', description: 'Trip UUID' })
  @Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin, ERole.StoreManager, ERole.StoreStaff)
  @HttpCode(HttpStatus.OK)
  @Post('trips/:id/location')
  public async updateDriverLocation(
    @Param('id') id: string,
    @Body() body: UpdateDriverLocationRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    const organizationId = requireOrganizationId(user);
    const command = new UpdateDriverLocationCommand();
    command.tripId = id;
    command.driverId = body.driverId;
    command.latitude = body.latitude;
    command.longitude = body.longitude;
    command.accuracy = body.accuracy;
    command.organizationId = organizationId;
    await this.mediator.execute<UpdateDriverLocationCommand, void>(command);
    return true;
  }

  @ApiOperation({ summary: 'Get fleet live locations' })
  @ApiOkResponse({ type: [FleetLiveLocationResponse] })
  @Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @Get('fleet/live-locations')
  public async getFleetLiveLocations(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FleetLiveLocationResponse[]> {
    const organizationId = requireOrganizationId(user);
    const query = new GetFleetLiveLocationsQuery();
    query.organizationId = organizationId;
    const items = await this.mediator.execute<GetFleetLiveLocationsQuery, FleetLiveLocation[]>(query);
    return items.map((item) => ({
      tripId: item.tripId,
      driverId: item.driverId,
      vehicleId: item.vehicleId,
      latitude: item.latitude,
      longitude: item.longitude,
      gpsTime: item.gpsTime,
    }));
  }

  @ApiOperation({ summary: 'Initiate delivery OTP for a stop' })
  @ApiOkResponse({ type: OtpInitiatedResponse })
  @ApiParam({ name: 'tripId', description: 'Trip UUID' })
  @ApiParam({ name: 'stopId', description: 'Stop UUID' })
  @Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin, ERole.StoreManager, ERole.StoreStaff)
  @HttpCode(HttpStatus.OK)
  @Post('trips/:tripId/stops/:stopId/initiate-delivery')
  public async initiateDelivery(
    @Param('tripId') tripId: string,
    @Param('stopId') stopId: string,
    @Body() body: InitiateDeliveryOtpRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OtpInitiatedResponse> {
    const organizationId = requireOrganizationId(user);
    const command = new InitiateDeliveryOtpCommand();
    command.tripId = tripId;
    command.stopId = stopId;
    command.driverUserId = body.driverUserId;
    command.organizationId = organizationId;
    const result = await this.mediator.execute<InitiateDeliveryOtpCommand, InitiateDeliveryOtpResult>(command);
    return { maskedEmail: result.maskedEmail };
  }

  @ApiOperation({ summary: 'Confirm delivery with OTP' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'tripId', description: 'Trip UUID' })
  @ApiParam({ name: 'stopId', description: 'Stop UUID' })
  @Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin, ERole.StoreManager, ERole.StoreStaff)
  @HttpCode(HttpStatus.OK)
  @Post('trips/:tripId/stops/:stopId/confirm-delivery')
  public async confirmDelivery(
    @Param('tripId') tripId: string,
    @Param('stopId') stopId: string,
    @Body() body: ConfirmDeliveryOtpRequest,
    @CurrentUser() _user: AuthenticatedUser,
  ): Promise<boolean> {
    const command = new ConfirmDeliveryOtpCommand();
    command.tripId = tripId;
    command.stopId = stopId;
    command.otp = body.otp;
    command.driverUserId = body.driverUserId;
    return this.mediator.execute<ConfirmDeliveryOtpCommand, boolean>(command);
  }

  @ApiOperation({ summary: 'Resend delivery OTP for a stop' })
  @ApiOkResponse({ type: OtpInitiatedResponse })
  @ApiParam({ name: 'tripId', description: 'Trip UUID' })
  @ApiParam({ name: 'stopId', description: 'Stop UUID' })
  @Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin, ERole.StoreManager, ERole.StoreStaff)
  @HttpCode(HttpStatus.OK)
  @Post('trips/:tripId/stops/:stopId/resend-otp')
  public async resendOtp(
    @Param('tripId') tripId: string,
    @Param('stopId') stopId: string,
    @Body() body: InitiateDeliveryOtpRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OtpInitiatedResponse> {
    const organizationId = requireOrganizationId(user);
    const command = new ResendDeliveryOtpCommand();
    command.tripId = tripId;
    command.stopId = stopId;
    command.driverUserId = body.driverUserId;
    command.organizationId = organizationId;
    const result = await this.mediator.execute<ResendDeliveryOtpCommand, ResendDeliveryOtpResult>(command);
    return { maskedEmail: result.maskedEmail };
  }
}
