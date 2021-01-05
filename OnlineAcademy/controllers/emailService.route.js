const nodemailer = require("nodemailer");

module.exports = {
    sendConfirmationEmail(user, token ,callback) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
        });
        const url = `http://yanghoco.ddns.net/user/confirmation/${token}`;
        let mailOptions = {
            from: process.env.GMAIL_USER,
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
                console.log("Data" + data);
            }
            callback(err, data);
        });
    }
};
