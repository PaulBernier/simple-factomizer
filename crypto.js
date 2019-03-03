const crypto = require('crypto');

function sha512(data) {
    return crypto.createHash('sha512').update(data).digest();
}

module.exports = {
    sha512
}