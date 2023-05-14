const nodemailer = require('nodemailer');

const sendMail = async (sendTo) => {
  //creating the transporter

  let transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  //createSendTo Options

  const sendToOptions = {
    from: 'Abdulaziz Hassan <abdulazizhassankehinde@gmail.com>',
    to: sendTo.email,
    subject: sendTo.text,
    text: sendTo.message,
  };
  await transport.sendMail(sendToOptions);
};
module.exports = sendMail;
