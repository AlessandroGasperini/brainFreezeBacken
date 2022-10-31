const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router()
const bcryptFunctions = require('../bcrypt');
const dbo = require("../db/connect")

const ObjectId = require("mongodb").ObjectId;


// Skapa konto
router.route("/addAccount").post(async (req, ressponse) => {
    const credentials = req.body

    const resObj = {
        success: true,
        usernameExists: false,
        emailExists: false,
    };

    const hashedPassword = await bcryptFunctions.hashPassword(credentials.password);
    credentials.password = hashedPassword;

    let db_connect = dbo.getDb()
    db_connect.collection("accounts")
        .insertOne(credentials, function (err, res) {
            if (err) throw err
            ressponse.json(res)
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
        if (!isMatch) {
            console.log('WRONG USERNAME')
            response.json(resObj)
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
                response.json(resObj)
            } else {
                response.json(resObj)
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
        response.json(isMatch)
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
    response.json(resObj);
});

module.exports = router