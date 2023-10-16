const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    googleId: String,
    isverified: {
        type: Boolean,
        defualt: false
    },
    // verificationToken: String,
});

module.exports = mongoose.model('User', userSchema);
