const express = require('express');

const router = express.Router()
const dbo = require("../db/connect")

const ObjectId = require("mongodb").ObjectId;


//Hitta en uppgift med rätt level och ämnen
router.route("/serachTasks").post(async function (req, res) {
    let credentials = req.body
    const task = credentials.subjects.join('')
    let db_connect = dbo.getDb()
    let resObj = {
        taskFound: false,
        taskAlreadyExists: false
    }
    //Hitta en random uppgift som stämmer överens med det man efterfrågar (level och ämne)
    db_connect.collection("tasks")
        .findOne({
            level: credentials.level,
            subject: task
        }, async function (err, isMatch) {
            if (isMatch) {
                resObj.taskFound = true
                const randomTask = isMatch.tasks[Math.floor(Math.random() * isMatch.tasks.length)];

                db_connect.collection("accounts")
                    .findOne({
                        _id: ObjectId(credentials.id)
                    }, async function (err, player) {
                        console.log(player.tasksInProgress);
                        console.log(isMatch.name);

                        if (player.tasksInProgress.find(e => e.name === randomTask.name)) {
                            resObj.taskAlreadyExists = true
                            console.log("Denna uppgift är redan tilllagd i din profil");
                            res.send(resObj)
                        } else {
                            res.send(resObj)
                            await db_connect.collection("accounts").updateOne(player, {
                                $push: {
                                    tasksInProgress: {
                                        ...randomTask,
                                        subject: isMatch.subject,
                                        title: isMatch.title,
                                        level: isMatch.level
                                    }
                                }
                            })
                        }
                    })
            } else {
                res.send(resObj)
            }
        })

})


// Skicka in gjord uppgift
router.route("/doneTask").post(async function (req, res) {
    let credentials = req.body
    let db_connect = dbo.getDb()
    let findPlayer = {
        _id: ObjectId(credentials.taskDoneBy)
    }
    console.log(credentials.name);
    await db_connect.collection("doneTasks")
        .insertOne(credentials, function (err, res) {
            console.log("Inlagt task");
        })

    await db_connect.collection("accounts")
        .updateOne(findPlayer, {
            $pull: {
                tasksInProgress: {
                    name: credentials.name

                }
            }
        })
})

// Ta bort pågående uppgift
router.route("/deleteTask").delete(async function (req, res) {
    let credentials = req.body
    let db_connect = dbo.getDb()
    let findPlayer = {
        _id: ObjectId(credentials.userId)
    }
    //Hitta en random uppgift som stämmer överens med det man efterfrågar (level och ämne)
    await db_connect.collection("accounts")
        .updateOne(findPlayer, {
            $pull: {
                tasksInProgress: {
                    name: credentials.chosenTask.name

                }
            }
        })

    res.json()
})




// Lägg till ny uppgift
router.route("/sendNewTask").post(async function (req, res) {
    let credentials = req.body
    console.log(credentials);

    let db_connect = dbo.getDb()
    let findCategory = {
        subject: credentials.subject,
        level: credentials.level
    }

    let newCategory = {
        title: credentials.title,
        tasks: [credentials.task],
        subject: credentials.subject,
        level: credentials.level
    }

    db_connect.collection("tasks")
        .findOne({
            subject: credentials.subject,
            level: credentials.level
        }, async function (err, isMatch) {
            if (isMatch) {
                await db_connect.collection("tasks")
                    .updateOne(findCategory, {
                        $push: {
                            tasks: credentials.task
                        }
                    })
            } else {
                await db_connect.collection("tasks")
                    .insertOne(newCategory, function (err, res) {
                        console.log("Inlagt ny taskämne");
                    })
            }
        })
})





module.exports = router