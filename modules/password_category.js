const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://jaysmilet:jaysmilet1234@cluster0.7ub8g.mongodb.net/pms?retryWrites=true&w=majority', { useNewUrlParser: true, useCreateIndex: true });
var conn = mongoose.Collection;
var passcatSchema = new mongoose.Schema({
    password_category: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

var passcatModel = mongoose.model('password_categories', passcatSchema);
module.exports = passcatModel;