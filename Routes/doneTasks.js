const express = require('express');

const router = express.Router()
const dbo = require("../db/connect")

const ObjectId = require("mongodb").ObjectId;


router.route("/allMyDoneTasks").post(async function (req, res) {
    const credentials = req.body
    console.log(credentials);
    let db_connect = dbo.getDb()

    let myquery = {
        taskDoneBy: credentials.id
    }

    db_connect.collection("doneTasks")
        .find({
            taskDoneBy: credentials.id
        })
        .toArray(function (err, result) {
            if (err) throw err
            res.json(result)
        })

})


router.route("/likeComment").put(async function (req, res) {
    let credentials = req.body
    console.log(credentials);

    let db_connect = dbo.getDb()

    db_connect.collection("doneTasks")
        .findOne({
            _id: ObjectId(credentials.id)
        }, async function (err, isMatch) {
            // const found = isMatch.feedback.find(element => element._id === ObjectId(credentials.commentID));
            console.log(isMatch.feedback);

            // hitta dendär jävla kommentaren som id
        })

})


module.exports = router