const nodemailer = require("nodemailer");
module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: `Hi there,
Thank you for signing up for Notes App. Click on the link below to :
${text}
If you did not sign up for a Notes account,
you can safely ignore this email.

Best,

Yasmeen`
        });
    }
    catch (error) {
        console.log(error);
        return error;
    }
}