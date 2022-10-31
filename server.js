const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config({
    path: "./config.env"
});
const port = process.env.PORT || 3333;
app.use(cors());
app.use(express.json());

const dbo = require('./db/connect');


app.use(require("./routes/accounts"))
app.use(require("./routes/subjects"))
app.use(require("./routes/tasks"))
app.use(require("./routes/doneTasks"))




app.listen(port, () => {
    dbo.connectToServer(function (err) {
        if (err) {
            console.error(err);
        }
    })
    console.log('server is running on ', port)
});