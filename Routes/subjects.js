const express = require('express');

const router = express.Router()
const dbo = require("../db/connect")

const ObjectId = require("mongodb").ObjectId;

router.route("/addSubject").put(async function (req, res) {
    let credentials = req.body
    let db_connect = dbo.getDb()
    let myquery = {
        _id: ObjectId(credentials.userId)
    }

    let updated = {
        $push: {
            subjects: {
                subject: credentials.subject,
                title: credentials.title
            }
        }
    }
    db_connect.collection("accounts")
        .findOne({
            _id: ObjectId(credentials.userId)
        }, async function (err, isMatch) {
            if (err) response.status(400)

            if (isMatch.subjects.find(e => e.subject === credentials.subject)) {
                console.log("Den finns, lägg inte till");
            } else {
                console.log("Den finns inte, lägg till");
                await db_connect.collection("accounts").updateOne(myquery, updated, function (err, result) {
                    if (err) response.status(400)
                    res.status(200)
                })
            }
        })

})


router.route("/removeSubject").delete(async function (req, res) {
    const credentials = req.body
    console.log("jdsajkodjasocaso", credentials);
    let db_connect = dbo.getDb()
    let findPlayer = {
        _id: ObjectId(credentials.id)
    }

    let updated = {
        $pull: {
            subjects: {
                subject: credentials.subject.subject

            }
        }
    }
    //Hitta en random uppgift som stämmer överens med det man efterfrågar (level och ämne)
    await db_connect.collection("accounts")
        .updateOne(findPlayer, updated, function (err, result) {
            if (err) res.status(400)
            res.status(200)
        })

    db_connect.collection("accounts")
        .findOne({
            _id: ObjectId(credentials.id)
        }, async function (err, isMatch) {
            if (err) res.status(400)
            res.json(isMatch.subjects)
        })
})





module.exports = router