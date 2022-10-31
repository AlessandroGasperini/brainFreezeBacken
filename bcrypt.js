const bcrypt = require("bcryptjs")
const saltRounds = 10;

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
}

async function comparePassword(password, hash) {
    const isMatch = await bcrypt.compare(password, hash);

    return isMatch;
}


module.exports = {
    hashPassword,
    comparePassword
}