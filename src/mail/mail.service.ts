import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailService: MailerService) {}
  async sendEmail(email: string, pincode: string) {
    const response = await this.mailService.sendMail({
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: 'Guess words pincode',
      text: `Please enter this pincode (${pincode}) to register in the app`,
      template: './pincode',
      context: {
        pincode,
      },
    });

    return response;
  }

  async sendRecoveryPasswordEmail(email: string, pincode: string) {
    const response = await this.mailService.sendMail({
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: 'Guess words pincode',
      text: `Please enter this pincode (${pincode}) to recovery password in the app`,
      template: './recovery',
      context: {
        pincode,
      },
    });

    return response;
  }
}
