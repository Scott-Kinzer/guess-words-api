import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailService: MailerService) {}
  sendEmail(email: string, pincode: string) {
    const response = this.mailService.sendMail({
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: 'Guess words pincode',
      text: `Please enter this pincode (${pincode}) to register in the app`,
    });

    return response;
  }
}
