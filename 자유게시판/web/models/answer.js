var mongoose = require('mongoose'),
    mongoosePaginate= require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
    name: {type:String, ref:'Post'},
    post: {type: Schema.Types.ObjectId, ref:'Post'},
    content: {type:String, trim: true, required: true},
    reg_date : {type:Date, default:Date.now}
}, {
    toJson:{ virtuals: true},
    toObject: {virtuals:true}
});
schema.plugin(mongoosePaginate);
var Answer = mongoose.model('Answer', schema)
module.exports = Answer;