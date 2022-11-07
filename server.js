const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config({
    path: "./config.env"
});
const port = process.env.PORT || 3333;

app.use(cors({
    origin: '*'
}));
app.use(express.json());

const dbo = require('./db/connect');


app.use(require("./Routes/accounts"))
app.use(require("./Routes/subjects"))
app.use(require("./Routes/tasks"))
app.use(require("./Routes/doneTasks"))
app.use(require("./Routes/email"))




app.listen(port, () => {
    dbo.connectToServer(function (err) {
        if (err) {
            console.error(err);
        }
    })
    console.log('server is running on ', port)
});