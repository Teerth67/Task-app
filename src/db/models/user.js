const mongoose= require('mongoose')
const validator = require('validator')
const bcrypt=require('bcryptjs')

const Tasks=require('./tasks')
const jwt =require('jsonwebtoken')

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
       trim:true
    },email:{
        type:String,
        unique: true, 
       
        trim:true,
        lowercase:true,
        required:true,
        async validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
           
        }

    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error("Invalid password")
            }
        }

    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("Invalid age")
            }
        }       
    },
   
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    
    
   
    
 upload:{
    type:Buffer
 }
   
},{
    timestamps:true
})
userSchema.virtual('tasks',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'owner'

})
userSchema.methods.toJSON=function(){
    const user=this
    const uobj=user.toObject()
    delete uobj.password
    delete uobj.tokens
    delete uobj.upload
    return uobj
}
userSchema.methods.generateAuthToken = async function () {
    try {
        const user = this;
        const token = jwt.sign({ _id: user._id.toString() }, 'thisismytimecourse');
        user.tokens=user.tokens.concat({token})
        await user.save()
        return token;
    } catch (error) {
        throw new Error('Failed to generate auth token');
    }
};

userSchema.statics.findbyCredentials=async(email,password)=>{
    const user=await User.findOne({email})
    if(! user){
        throw new Error("unable to login")
    }
    const isMatch= await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("unable to login")
    }
    return user
}
userSchema.pre('save',async function(next){
    const user=this
   if(user.isModified('password')){
    user.password=await bcrypt.hash(user.password,8)
   }
    next()
})
userSchema.pre('remove',async function(next){
    const user=this
   await Tasks.deleteMany({owner:user._id})
    next()
})

const User=mongoose.model('User',userSchema)

module.exports=User