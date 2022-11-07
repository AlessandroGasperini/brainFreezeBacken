const express = require('express');

const router = express.Router()
const dbo = require("../db/connect")

const ObjectId = require("mongodb").ObjectId;


router.route("/allMyDoneTasks").post(async function (req, res) {
    const credentials = req.body
    console.log(credentials);
    let db_connect = dbo.getDb()

    db_connect.collection("doneTasks")
        .find({
            taskDoneBy: credentials.id
        })
        .toArray(function (err, result) {
            if (err) response.status(400)
            res.json(result).status(200)
        })

})


router.route("/likeComment").put(async function (req, res) {
    let credentials = req.body

    let db_connect = dbo.getDb();
    let myquery = {
        _id: ObjectId(credentials.id)
    }

    let feedbackUser = {
        user: credentials.user,
        commentId: credentials.commentID
    }

    await db_connect.collection("doneTasks")
        .findOne({
            _id: ObjectId(credentials.id)
        }, async function (err, isMatch) {
            if (err) response.status(400)

            const newArr = isMatch.feedback.map(obj => {
                if (credentials.likeOrDislike === "like") {

                    if (ObjectId(obj._id).valueOf() == credentials.commentID) {
                        return {
                            ...obj,
                            likes: obj.likes + 1
                        };
                    }
                    return obj;
                } else {
                    if (ObjectId(obj._id).valueOf() == credentials.commentID) {
                        return {
                            ...obj,
                            dislikes: obj.dislikes + 1
                        };
                    }
                    return obj;
                }
            })


            let newObject = {
                $set: {
                    _id: isMatch._id,
                    name: isMatch.name,
                    assignment: isMatch.assignment,
                    img: isMatch.img,
                    hints: isMatch.hints,
                    madeBy: isMatch.madeBy,
                    id: isMatch.id,
                    subject: isMatch.subject,
                    title: isMatch.title,
                    level: isMatch.level,
                    taskDoneBy: isMatch.taskDoneBy,
                    fullName: isMatch.fullName,
                    email: isMatch.email,
                    doneAssignment: isMatch.doneAssignment,
                    rating: isMatch.rating,
                    feedback: newArr,
                    comment: isMatch.comment,
                    feedbackUsers: [...isMatch.feedbackUsers, feedbackUser]
                }
            }


            await db_connect
                .collection('doneTasks')
                .updateOne(myquery, newObject, function (err, result) {
                    if (err) response.status(400)
                    res.json(newObject.$set).status(200)
                })

        })
})



// Hämta allas gjorda tasks
router.route("/allTasks").post(async function (req, res) {
    const credentials = req.body
    let db_connect = dbo.getDb()

    db_connect.collection("doneTasks")
        .find({
            subject: credentials.subject

        })
        .toArray(function (err, result) {
            if (err) response.status(400)
            res.json(result).status(200)
        })

})


// Hämta alla ämnen som går att söka mellan
router.route("/allSubjects").get(async function (req, res) {

    let db_connect = dbo.getDb()

    db_connect.collection("subjects")
        .find({})
        .toArray(function (err, result) {
            if (err) response.status(400)
            res.json(result).status(200)
        })
})



// Lägg till kommentar
router.route("/addComment").post(async function (req, res) {
    const credentials = req.body
    console.log(credentials);

    let db_connect = dbo.getDb()
    let myquery = {
        _id: ObjectId(credentials.questionId)
    }
    await db_connect.collection("doneTasks").updateOne(myquery, {
        $push: {
            feedback: {
                title: credentials.title,
                comment: credentials.comment,
                user: credentials.user,
                likes: 0,
                dislikes: 0,
                timeStamp: credentials.today,
                _id: ObjectId()
            }
        }
    })

    db_connect.collection("doneTasks")
        .findOne({
            _id: ObjectId(credentials.questionId)
        }, async function (err, isMatch) {
            if (err) response.status(400)
            res.json(isMatch.feedback).status(200)
        })

})


module.exports = router