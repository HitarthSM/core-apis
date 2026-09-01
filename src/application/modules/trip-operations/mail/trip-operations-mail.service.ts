import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { MailService, EmailTemplateData, MailOptions, EMAIL_TEMPLATE_REPO, IEmailTemplateRepo } from '../../../../common';

@Injectable()
export class TripOperationsMailService extends MailService {
  public constructor(
    options: MailOptions,
    @Inject(EMAIL_TEMPLATE_REPO) private readonly templateRepo: IEmailTemplateRepo,
    @InjectPinoLogger(TripOperationsMailService.name) logger: PinoLogger,
  ) {
    super(options, logger);
  }

  protected async findTemplateAsync(slug: string): Promise<EmailTemplateData | null> {
    const template = await this.templateRepo.findBySlugAsync(slug);
    if (!template) return null;
    return { subject: template.subject, htmlBody: template.htmlBody };
  }

  public async sendDeliveryOtpAsync(to: string, otp: string, expiryMinutes: number): Promise<void> {
    await this.sendAsync({
      to,
      subject: 'Your Delivery OTP',
      html: `<p>Your delivery OTP is: <strong>${otp}</strong></p><p>This code expires in ${expiryMinutes} minutes.</p>`,
    });
  }
}
