const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true},
    name: { type: String, required: true},
    manufacturer: { type: String},
    description: { type: String},
    mainPepper: { type: String},
    imageUrl: { type: String},
    heat: { type: Number, required: true},
    likes: { type: Number},
    dislikes: { type: Number},
    usersLiked: { type: ["String <userId>"]},
    usersDisliked: { type: ["String <userId>"]},
});

module.exports = mongoose.model('Sauce', sauceSchema);