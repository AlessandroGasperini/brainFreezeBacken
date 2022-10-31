const {
    MongoClient
} = require("mongodb");

const Db = process.env.ATLAS_URI;

const client = new MongoClient(Db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let _db;


module.exports = {
    connectToServer(callbak) {
        client.connect(function (err, db) {
            // Kolla så vi fick in ett bra object
            if (db) {
                _db = db.db("accountsDB")
                console.log("De här gick bra de!");
            }
            return callbak(err)
        })
    },

    getDb: function () {
        return _db;
    }
}