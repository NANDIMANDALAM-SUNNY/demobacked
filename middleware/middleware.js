const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const userSchema = require('../models/user')

const saltRound = 10;
const secretKey = "sunny"


const hashPassword = async (password)=>{
    let salt = await bcrypt.genSalt(saltRound);
    let hashedPassword = await bcrypt.hash(password,salt)
    return hashedPassword
}
let hashCompare = async (password,hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword)
}


const createToken = async(email,id)=>{
    let token = await jwt.sign({email,id},secretKey,{expiresIn:"180m"})
    return token
}
const jwtDecode = async (token) =>{
    let data = await jwt.decode(token)
    return data
}



const validate =async (req,res,next)=>{
    const token = req.header('jwt-token');
    // const {password,confirmPassword} = req.body


    if(!token) return res.status(401).send('Access denied. No token provided.');
    const data = await jwtDecode(token)
    const currentTime = Math.round(new Date()/1000)
    // const user = await userSchema.findOne({_id:decoded.id})
    if(currentTime<=data.exp ) {
        next()
    }    
    else{
        res.send({
            statusCode:401,
            message:"Token Expired"
        })
    }
}










module.exports={hashPassword,hashCompare,createToken,jwtDecode,validate}