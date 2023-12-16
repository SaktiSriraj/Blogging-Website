import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import bcrypt from "bcrypt"; //used for password encryption

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})

//making routes
server.post("/sign-up", (req, res) => {
    
    let {fullname, email, password} = req.body;

    //validate the data from frontend
    if(fullname.length < 3){
        return res.status(403).json({"Error":"Fullname must be atleast 3 letters long"});
    }

    if(!email.length){
        return res.status(403).json({"Error":"Enter Email"});
    }

    if(!emailRegex.test(email)){
        return res.status(403).json({"Error":"Enter valid email"});
    }

    if(!passwordRegex.test(password)){
        return res.status(403).json({"Error":"Password must be 6 - 20 characters long with atleast one numeric, one lowercase letter and one uppercase letter"});
    }

    //password encryption
    bcrypt.hash(password, 10, (err,hashedPw)=>{
        let username = 
        console.log(hashedPw);
    })

    return res.status(200).json({"Status": "OK"});

})



server.listen(PORT, ()=>{
    console.log('listening on port -> ' + PORT)
});