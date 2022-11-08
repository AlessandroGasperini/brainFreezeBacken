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
            if (err) res.status(400)
            if (isMatch) {
                resObj.taskFound = true
                const randomTask = isMatch.tasks[Math.floor(Math.random() * isMatch.tasks.length)];

                db_connect.collection("accounts")
                    .findOne({
                        _id: ObjectId(credentials.id)
                    }, async function (err, player) {
                        if (err) res.status(400)
                        // Om uppgiften redan finns (lägg inte till samma)
                        if (player.tasksInProgress.find(e => e.name === randomTask.name)) {
                            resObj.taskAlreadyExists = true
                            console.log("Denna uppgift är redan tilllagd i din profil");
                            res.send(resObj).status(200)
                        } else {
                            res.send(resObj).status(200)
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
                res.send(resObj).status(200)
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
        .insertOne(credentials, function (err, result) {
            if (err) res.status(400)
            res.status(200)
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
    let updated = {
        $pull: {
            tasksInProgress: {
                name: credentials.chosenTask.name

            }
        }
    }

    await db_connect.collection("accounts")
        .updateOne(findPlayer, updated, function (err, result) {
            if (err) {
                res.json(result).status(400)
            } else {
                res.json(result).status(200)
            }
        })
})


// Lägg till ny uppgift (om kategorin med samma nivå finns pushas den in i den arrayen)
// om den kategorin och leveln inte finns skapas ett helt nyss obj som andra kan lägga till i
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
            if (err) throw err
            // res.status(400) // Laggar lite hmmmmm why why
            if (isMatch) {
                // res.status(200) // Laggar lite hmmmmm why why
                await db_connect.collection("tasks")
                    .updateOne(findCategory, {
                        $push: {
                            tasks: credentials.task
                        }
                    })
            } else {
                await db_connect.collection("tasks")
                    .insertOne(newCategory, function (err, result) {
                        if (err) throw err
                        // res.status(400) hej hallå du är fett jobbig vrf laggar du?
                        // res.status(200) du med?
                    })

            }
        })
})



module.exports = router