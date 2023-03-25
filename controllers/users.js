const jwt = require('jsonwebtoken');
const {registerMail, sendResetpasswordMail} = require('../utils/utils')
const nodemailer = require('nodemailer');
const {hashPassword,hashCompare,createToken, jwtDecode} = require('../middleware/middleware');
const userSchema = require('../models/user')
const {cloudinary} = require('../utils/cloudinary')
const randomString = require('randomstring');


const Register =async (req,res)=>{
    try {
        let user = await userSchema.findOne({email:req.body.email})
        if(user){
          res.send({ statusCode:409, message:"User Already Exists" })
        }
        else{
          let hashedPassword = await hashPassword(req.body.password)
          const uploadResponse = await cloudinary.uploader.upload(req.body.profile, {upload_preset: 'testing api',})
          const object = {
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword,
            profile:uploadResponse.url
          }
          const vtoken = await randomString.generate();
          await userSchema.create(object);
          const data = await  userSchema.updateOne({email:object.email},{$set:{verificationToken:vtoken}});
          if(data){
              registerMail(req.body.name,req.body.email,vtoken)
              res.send({statusCode:200,message:"Success"})
           }
          }
      }
      catch (error) {
       console.log(error)
       res.send({ statusCode:500,  message:"Error" }) 
      }
}


const login = async (req,res)=>{
    try {
      let user = await userSchema.findOne({email:req.body.email})
      if(user.email !== null){
      if(user.isVerified !== true) return res.send({statusCode:400, message : "Please Verify Your Account"})
        let compare = await hashCompare(req.body.password,user.password)
          if(!compare) return res.send({statusCode:400, message : "Invalid Credentials"})
             const jwttoken = await createToken(user.email,user._id)
              res.send({ statusCode:200, message:"Logged in Succesfully ", data:jwttoken })
          }
      else{
        res.send({ statusCode:400, message:"Authentication Failed", })
      }
    } catch (error) {
     res.send({ statusCode:500,  message:"Authentication Failed"  }) 
    }
  }


  const confirmAccount =async (req, res) => {
    try {
      const {confirmationToken} = req.params
      console.log(confirmationToken)
      const user = await userSchema.findOne({verificationToken:confirmationToken})
      if(!user) return res.send({ statusCode:400,  message:"User Already Verified" })
      else{
        const updateUser = await userSchema.updateOne({verificationToken:confirmationToken},{$set:{isVerified:true}},{$unset:{verificationToken:1}})
        const updateUsers = await userSchema.updateOne({verificationToken:confirmationToken},{$unset:{verificationToken:1}})
        res.send({ statusCode:200, message:"Success", data:updateUsers})
      }
    } catch (error) {
      res.send({
        statusCode:500,
        message:"Error"
      })
    }
  }




  const forgotPassword = async (req,res)=>{
    try {
      console.log(req.body.email)
     const userData =  await userSchema.findOne({email:req.body.email})
     if(userData){
        const token = jwt.sign({email:req.body.email},'jsonsecret',{expiresIn:'15m'})
        const data = await  userSchema.updateOne({email:req.body.email},{$set:{forgotPasswordToken:token}});
        sendResetpasswordMail(userData.name,userData.email,token)
          res.send({
         statusCode:200,
         message:"Please check your email for to reset mail"
     })

     }else{
        res.send({
            statusCode:200,
            message:"Email Not Found"
        })
     }
    } catch (error) {
        console.log(error)
        res.send({
            statusCode:400,
            message:error
        })
    }
}



const resetPassword =async (req,res)=>{
  try {
    const tokenData = await  userSchema.findOne({forgotPasswordToken:req.params.token})
    // console.log(req.params.token)
    if(tokenData){
      const decodeJWt = await jwtDecode(tokenData.forgotPasswordToken);
       let currentTime = Math.round(new Date()/1000)
      if(currentTime<=decodeJWt.exp) {
          // const password = req.body.password;
          // const newPassword = await hashPassword(password)
          // const updatePassword = await userSchema.findByIdAndUpdate({_id:tokenData._id},{$set:{forgotPasswordToken:""}},{new:true});  //new true returns updated data
          res.send({
              statusbar:200,
              success:true,
              message:"Token verified Successfully",
              data:tokenData
          })
      }
      else{
      // res.status(400).send({success:true,msg:"Link has been expired"})//
        res.send({
          statusbar:204,
          success:true,
          message:"Link has been expired",
        })

      }
  }
  else{
      // res.status(400).send({success:true,msg:"This link has already used to reset password"})
      res.send({
      statusbar:204,
        success:true,
        message:"This link has already used to reset password",
      })
  }
  } catch (error) {
      // res.status(400).send({success:false,msg:"Error"})
      res.send({
        statusbar:204,
        success:false,
        message:"Error"
      })
  }
}





const newPassword = async (req,res)=>{
try {
  const {token} = req.params

  const decoded = await jwtDecode(token);
  const password = req.body.password
  const newPassword = await hashPassword(password)
  console.log(decoded)
  const user = await userSchema.findOneAndUpdate({email:decoded.email},{$set:{password:newPassword,forgotPasswordToken:""}},{new:true})
  console.log(user)
  res.send({
      statusbar:200,
      success:true,
      message:"Password Updated Successfully",
      data:user
  })
  
} catch (error) {
  res.send({
    statusCode:400,
    message:error
  })
}
}


const getProfile = async (req, res)  =>{
  try {
    const token = req.header('jwt-token');
    const decoded = await jwtDecode(token)
    const user = await userSchema.findOne({_id:decoded.id})
    res.send({ statusbar:200, success:true, message:"Profile Fetched Successfully", data:user })
  }
    catch (error) {
      res.send({ statusCode:400, message:error  })
    }
}


module.exports = {Register, login, confirmAccount, forgotPassword, resetPassword, newPassword, getProfile}


