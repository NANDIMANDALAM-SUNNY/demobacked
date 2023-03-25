const mongoose = require('mongoose');
const validator = require('validator')


const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:(value)=>{
            return validator.isEmail(value)
        }
    },
    password:{
        type:String,
        required:true,
    },
    profile:{
        type:String,
        required:true,
    },
   
    verificationToken:{
        type:String,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    forgotPasswordToken:{
        type:String 
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expireAfterSeconds: 30 
    },
})

module.exports = mongoose.model('user',userSchema);