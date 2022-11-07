const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router()
const bcryptFunctions = require('../bcrypt');
const dbo = require("../db/connect")

const ObjectId = require("mongodb").ObjectId;


// Skapa konto
router.route("/addAccount").post(async (req, response) => {
    const credentials = req.body
    const resObj = {
        success: true,
        usernameExists: false,
        emailExists: false,
    };

    const hashedPassword = await bcryptFunctions.hashPassword(credentials.password);
    credentials.password = hashedPassword;

    let db_connect = dbo.getDb()


    db_connect.collection('accounts').findOne({
        username: credentials.username
    }, async function (err, isMatch) {
        if (err) response.status(400)
        if (isMatch) {
            if (isMatch.username === credentials.username) {
                resObj.usernameExists = true
                resObj.success = false
                response.json(resObj).status(200)
            }
        } else {
            db_connect.collection('accounts').findOne({
                email: credentials.email
            }, async function (err, isMatch) {
                if (err) response.status(400)

                if (isMatch) {
                    if (isMatch.email === credentials.email) {
                        resObj.emailExists = true
                        resObj.success = false
                        res.json(resObj).status(200)
                    }
                } else {
                    let db_connect = dbo.getDb()
                    db_connect.collection("accounts")
                        .insertOne(credentials, function (err, result) {
                            if (err) response.status(400)
                            else
                                response.json(resObj).status(200)
                        })
                }
            })
        }

    })

})


//Logga in
router.route("/login").post(async (req, response) => {
    const credentials = req.body
    console.log(credentials);
    const resObj = {
        success: false,
        usernameExists: false,
        firstname: "",
        lastname: "",
        _id: "",
        subjects: null,
        token: "",
        tasksInProgress: []
    };

    let db_connect = dbo.getDb()

    db_connect.collection('accounts').findOne({
        username: credentials.username
    }, async function (err, isMatch) {
        if (err) response.status(400)
        if (!isMatch) {
            console.log('WRONG USERNAME')
            response.json(resObj).status(200)
        } else {
            console.log('CORRECT USERNAME')
            resObj.usernameExists = true
            const correctPassword = await bcryptFunctions.comparePassword(credentials.password, isMatch.password);
            if (correctPassword) {
                resObj.firstname = isMatch.firstname
                resObj.lastname = isMatch.lastname
                resObj._id = isMatch._id
                resObj.subjects = isMatch.subjects
                resObj.tasksInProgress = isMatch.tasksInProgress
                const token = jwt.sign({
                    username: isMatch.username
                }, "goodagain", {
                    expiresIn: 600
                });
                resObj.token = token
                resObj.success = true
                response.json(resObj).status(200)
            } else {
                response.json(resObj).status(200)
            }
        }
    })
})

router.route("/getAllUserInfo").post(async (request, response) => {
    const credentials = request.body

    let db_connect = dbo.getDb()

    db_connect.collection('accounts').findOne({
        _id: ObjectId(credentials.id)
    }, async function (err, isMatch) {
        if (err) response.status(400)

        let sendInfo = {
            ...isMatch,
            password: "****"
        }
        response.json(sendInfo).status(200)
    })
})












//kolla om användaren är inloggad
router.get('/', async (request, response) => {
    let resObj = {
        loggedIn: false
    };

    const token = request.headers.authorization.replace('Bearer ', '');
    try {
        //jämför vår token mot den satta
        const data = jwt.verify(token, 'goodgood');
        if (data) {
            resObj.loggedIn = true;
        }
    } catch (error) {
        resObj.errorMessage = 'Token expired';
    }
    response.json(resObj).status(200).send('Found');
});





router.route("/changePassword").post(async (req, response) => {
    const credentials = req.body
    console.log(credentials);

    const hashedPassword = await bcryptFunctions.hashPassword(credentials.newPassword);

    let db_connect = dbo.getDb()

    let findPlayer = {
        email: credentials.email
    }

    await db_connect.collection("accounts")
        .updateOne(findPlayer, {
            $set: {
                password: hashedPassword

            }
        })
})



module.exports = router