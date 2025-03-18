const sgMail = require('@sendgrid/mail');
const constant = require("../config/constant");

sgMail.setApiKey(constant.SECRETCONFIG.SENDGRID_API_KEY);

module.exports = {
    send_mail: async (data) => {
        const msg = {
            from: constant.SECRETCONFIG.SENDGRID_SEND_EMAIL,
            to: data.to,
            subject: data.subject,
            html: data.mailData
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent');
            })
            .catch((error) => {
                console.error(error);
            })
        return true;
    }
}