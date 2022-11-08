const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router()

const dbo = require("../db/connect")

// Skickar bekräftelsekod för att ändra lösenord. Om emailen stämmer
router.route("/resetPassword").post(async function (req, res) {
    let emailData = req.body

    let noEmail = {
        res: false
    }
    let db_connect = dbo.getDb()

    db_connect.collection("accounts")
        .findOne({
            email: emailData.to
        }, async function (err, isMatch) {
            if (err) res.status(400)
            if (isMatch) {
                noEmail.res = true
                res.json(noEmail).status(200)

                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "brain.freeze.studies@gmail.com",
                        pass: "iwzdgmetdqnchhmq"
                    }
                })

                const mailOptions = {
                    from: emailData.from,
                    to: emailData.to,
                    subject: emailData.subject,
                    text: emailData.message,
                }
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        res.status(400)
                    } else {
                        console.log("Email sent: ", info.response);
                    }
                })
            } else {
                res.json(noEmail).status(200)
            }
        })
});


module.exports = router