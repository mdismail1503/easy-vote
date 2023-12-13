/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `EASY VOTE <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      //send grid
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the actual email
  async send(template, subject) {
    // 1. Render the html based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    }); // this will take the file and then render the pug code into real html.

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: html,
      text: htmlToText.convert(html),
    };

    // 3. Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
    // await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Easy-Vote !!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token is valid for only 10 minutes"
    );
  }

  async sendThankYou() {
    await this.send("thankYouEmail", "Thank you for voting 🎉🎉");
  }
};

// const sendEmail = async (options) => {
//   // 1.Create a transporter

//   // 2. define the email options

//   //3.send the email

// };
