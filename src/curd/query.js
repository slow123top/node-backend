const User = require('../database/schema');

const query = User.find({}, (err, res) => {
    if (err) {
        return err;
    }
    else {
        return res;
    }
});
// module.exports = query;