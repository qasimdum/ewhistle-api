nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendMail = (to, subject, body) => {
  let mailOptions = {
    to: to,
    subject: subject,
    html: body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
}
module.exports = {sendMail};
