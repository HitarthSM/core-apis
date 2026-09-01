export * from './create-notification/create-notification.command';
export * from './create-notification/create-notification.command-handler';
export * from './update-notification/update-notification.command';
export * from './update-notification/update-notification.command-handler';
export * from './delete-notification/delete-notification.command';
export * from './delete-notification/delete-notification.command-handler';
export * from './mark-all-read/mark-all-read.command';
export * from './mark-all-read/mark-all-read.command-handler';
export * from './register-device/register-device.command';
export * from './register-device/register-device.command-handler';

import { CreateNotificationCommandHandler } from './create-notification/create-notification.command-handler';
import { UpdateNotificationCommandHandler } from './update-notification/update-notification.command-handler';
import { DeleteNotificationCommandHandler } from './delete-notification/delete-notification.command-handler';
import { MarkAllNotificationsReadCommandHandler } from './mark-all-read/mark-all-read.command-handler';
import { RegisterDeviceCommandHandler } from './register-device/register-device.command-handler';

export const NotificationCommandHandlers = [
  CreateNotificationCommandHandler,
  UpdateNotificationCommandHandler,
  DeleteNotificationCommandHandler,
  MarkAllNotificationsReadCommandHandler,
  RegisterDeviceCommandHandler,
];
