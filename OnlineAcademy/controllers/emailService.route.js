const nodemailer = require("nodemailer");
const GMAIL_USER = 'yanghoco3002@gmail.com'
const GMAIL_PASSWORD = '9:00*pm*15/04'

module.exports = {
    sendConfirmationEmail(user, token ,callback) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASSWORD
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
        });
        const url = `http://yanghoco.ddns.net/user/confirmation/${token}`;
        let mailOptions = {
            from: GMAIL_USER,
            to: user.email,
            subject: 'Message',
            text: 'Hi',
            //html: {
            //    path: process.cwd() + '/views/vwLogin/confirm.html'
            //}
            html: `<p>Hello ${user.username},</p>
                    <p>Follow this link to verify your email address.</p>
                    <p><a href='${url}'>${url}</a></p>
                    <p>If you didn’t ask to verify this address, you can ignore this email.</p>
                    <p>Thanks,</p>
                    <p>Your Yanghoco team</p>`
                    //Please click this email to confirm your email: <a href="${url}">Confirm account</a>`
        };
        
        transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.log("Error: ", err.message);
            }
            else {
                console.log("Email send!!!");
                console.log(data);
            }
            callback(err, data);
        });
    }
};
