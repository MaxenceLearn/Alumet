const mongoose = require("mongoose");

const AlumetSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 150
    },
    owner: {
        type: String,
        required: true,
        minLength: 1
    },
    description: {
        type: String,
        default: "Un endroit, pour tous !",
        maxLength: 2000
    },
    password : {
        type: String,
        required: false,
        minLength: 1,
        maxLength: 150
    }, 
    modules: {
        type: Array,
        required: true,
        default: []
    },
    font: {
        type: String,
        required: true,
        default: "pjs"
    },
    background: {
        type: String,
        required: true,
    },
    theme: {
        type: String,
        required: true,
        default: "light"
    },
    customsLinks: {
        type: Array,
        required: true,
        default: []
    },
    lastUsage: {
        type: Date,
        required: true,
        default: Date.now()
    },
    archived: {
        type: Boolean,
        required: true,
        default: false
    },
    brightness: {
        type: Number,
        required: true,
        default: 0.80
    },
});

const Alumet = mongoose.model("Alumet", AlumetSchema);
module.exports = Alumet;