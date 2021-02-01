const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://jaysmilet:jaysmilet1234@cluster0.7ub8g.mongodb.net/pms?retryWrites=true&w=majority', { useNewUrlParser: true, useCreateIndex: true });
var conn = mongoose.Collection;
var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

var userModel = mongoose.model('user', userSchema);
module.exports = userModel;