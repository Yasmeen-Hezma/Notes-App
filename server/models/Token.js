const mongoose = require('mongoose');
const User = require('./User');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User,
        unique: true,
    },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})
module.exports = mongoose.model('Token', tokenSchema);
