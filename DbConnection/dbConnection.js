const mongoose = require('mongoose');
require('dotenv').config()
const mongooseConnection = () =>{

  mongoose.set('strictQuery', false);

mongoose.connect(process.env.dbConnection, { useNewUrlParser: true,useUnifiedTopology: true}  )
.then(
  (res) =>  {
    console.log(`Database is Connected`)
  },
  err => { console.log(`Not Connected`) }
);
}

module.exports = {mongooseConnection}