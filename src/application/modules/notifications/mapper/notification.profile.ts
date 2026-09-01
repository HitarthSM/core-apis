import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NotificationEntity, UserDeviceTokenEntity } from '../../../../infrastructure/persistence/entities';
import { Notification, UserDeviceToken } from '../domain';
import {
  CreateNotificationRequest,
  SearchNotificationsRequest,
  ListNotificationsRequest,
  NotificationResponse,
  UpdateNotificationRequest,
} from '../models';
import { CreateNotificationCommand, UpdateNotificationCommand } from '../commands';
import { SearchNotificationsQuery, ListNotificationsQuery } from '../queries';

@Injectable()
export class NotificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) { super(mapper); }

  public get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, NotificationEntity, Notification);
      createMap(mapper, Notification, NotificationEntity);
      createMap(mapper, Notification, NotificationResponse);
      createMap(mapper, UserDeviceTokenEntity, UserDeviceToken);

      createMap(mapper, CreateNotificationRequest, CreateNotificationCommand);
      createMap(mapper, UpdateNotificationRequest, UpdateNotificationCommand);
      createMap(mapper, SearchNotificationsRequest, SearchNotificationsQuery);
      createMap(mapper, ListNotificationsRequest, ListNotificationsQuery);
    };
  }
}
