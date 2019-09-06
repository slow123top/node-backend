const mongoose = require('./connect');
let Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String },
    password: { type: String },
});

module.exports = mongoose.model('User', userSchema);

