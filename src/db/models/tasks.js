const mongoose= require('mongoose')
const schema= new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    status:{
        type:Boolean,
        default:false

    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'

    }
},{
    timestamps:true
})
const Tasks=mongoose.model('Tasks',schema)
module.exports=Tasks