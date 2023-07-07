require("dotenv").config();
const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');

module.exports.sendForgotPassEmail = (email, random) => {
    const transporter = nodemailer.createTransport(smtpTransport({
        service: "Gmail",
        host: process.env.EMAIL_HOST,
        secure: false,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_HOST_USER,
            pass: process.env.EMAIL_HOST_PASSWORD,
        },
        pool: true,
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    }));

    const mailOptions = {
        from: '"พระดาบส" <noreply@example.com>',
        to: email,
        subject: 'Reset Password',
        html: `<h3>Reset Password</h3>
        <h3>Hello ${email}</h3>
        <h4>New Password : ${random}</h4>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}