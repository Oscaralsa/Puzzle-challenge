import * as nodemailer from "nodemailer";

import { emailTemplate } from "../utils/emailTemplate";
import { UserEntity } from "../database/entity/user.entity";
import helpers from "../helper/helpers";
import { mailOptions } from "../types/interface";

class Mail {
  constructor(
    public to?: string,
    public subject?: string,
    public message?: string
  ) {}

  sendMail() {
    let mailOptions: mailOptions = {
      from: "no-reply@thepuzzle.digital",
      to: this.to!,
      subject: this.subject!,
      html: this.message!,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        return "Email sent succesfully.";
      }
    });
  }
}

export async function registerEmail(userCreated: UserEntity) {
  const subject: string = "You're account is now signed in our platform.";
  const message: string = emailTemplate(
    userCreated.email,
    userCreated.name,
    helpers.getCurrentDate().Day,
    helpers.getCurrentDate().Hour,
    "User Registered.",
    "Your email has been registered in our platform, now you can use our services!.",
    false,
    ""
  );
  let mail: Mail = new Mail(userCreated.email, subject, message);

  mail.sendMail();
}

export default new Mail();
