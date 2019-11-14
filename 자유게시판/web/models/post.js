var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;
//Post(id, title, content, reg_date, name)
var schema = new Schema({
    //id : {type: Schema.Types.ObjectId, trim:true, required:true},
    name :{type:String, trim:true, required:true},
    title :{type:String, trim:true, required:true},
    content : {type:String, trim:true, required:true},
    reg_date : {type:Date, default:Date.now}
}, {
    toJson: {virtuals:true},
    toObject: {virtuals :true}
});
schema.plugin(mongoosePaginate);
var Post = mongoose.model('Post', schema);

module.exports = Post;