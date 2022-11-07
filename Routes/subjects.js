const express = require('express');

const router = express.Router()
const dbo = require("../db/connect")

const ObjectId = require("mongodb").ObjectId;

router.route("/addSubject").put(async function (req, res) {
    let credentials = req.body
    // console.log(credentials);
    let db_connect = dbo.getDb()
    let myquery = {
        _id: ObjectId(credentials.userId)
    }
    db_connect.collection("accounts")
        .findOne({
            _id: ObjectId(credentials.userId)
        }, async function (err, isMatch) {
            if (isMatch.subjects.find(e => e.subject === credentials.subject)) {
                console.log("Den finns, lägg inte till");
                // res.status(400) ////
            } else {
                console.log("Den finns inte, lägg till");
                await db_connect.collection("accounts").updateOne(myquery, {
                    $push: {
                        subjects: {
                            subject: credentials.subject,
                            title: credentials.title
                        }
                    }
                })
                // res.status(200)
            }
        })
    // 
})


router.route("/removeSubject").delete(async function (req, res) {
    const credentials = req.body
    console.log("jdsajkodjasocaso", credentials);
    let db_connect = dbo.getDb()
    let findPlayer = {
        _id: ObjectId(credentials.id)
    }
    //Hitta en random uppgift som stämmer överens med det man efterfrågar (level och ämne)
    await db_connect.collection("accounts")
        .updateOne(findPlayer, {
            $pull: {
                subjects: {
                    subject: credentials.subject.subject

                }
            }
        })

    db_connect.collection("accounts")
        .findOne({
            _id: ObjectId(credentials.id)
        }, async function (err, isMatch) {
            res.json(isMatch.subjects)

        })
})



module.exports = router