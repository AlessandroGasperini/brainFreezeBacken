const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router()

const dbo = require("../db/connect")

const ObjectId = require("mongodb").ObjectId;

router.route("/resetPassword").post(async function (req, res) {

    let emailData = req.body
    console.log(emailData);
    let noEmail = {
        res: false
    }
    let db_connect = dbo.getDb()

    db_connect.collection("accounts")
        .findOne({
            email: emailData.to
        }, async function (err, isMatch) {
            console.log(isMatch);
            if (isMatch) {
                noEmail.res = true
                res.json(noEmail)

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
                    } else {
                        console.log("Email sent: ", info.response);
                    }
                })

            } else {
                res.json(noEmail)
            }
        })


    // Email info
    const from = emailData.from
    const to = emailData.to
    const subject = emailData.subject
    const message = emailData.message

    // email som skickas ifrån
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "phyllographen@gmail.com",
            pass: "kjxibzyyxhvdvjkh"
        }
    })


});


module.exports = router