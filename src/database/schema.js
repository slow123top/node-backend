const mongoose = require('./connect');
let Schema = mongoose.Schema;

const userSchema = new Schema({
    id: { type: String },
    name: { type: String },
    password: { type: String },
});

module.exports = mongoose.model('User', userSchema);

