import bcrypt from "bcrypt"; //used for password encryption
import 'dotenv/config';
import express from "express";
import jwt from 'jsonwebtoken'; //to create access token
import mongoose from "mongoose";
import { nanoid } from 'nanoid'; //gives random unique string
import User from './User.js';

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})


const formatDataToSend = (user) => {

    const accessToken = jwt.sign({ id:user._id}, process.env.SECRET_ACCESS_KEY )


    return {
        accessToken,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

//generating username
const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let usernameExists = await User.exists({"personal_info.username":username}).then((result)=>{result});

    if(!usernameExists)
        username+=nanoid().substring(0, 5);

    return username;


}

//making routes for signup route
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
    bcrypt.hash(password, 10, async (err,hashedPw)=>{

        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashedPw, username} //this will create an user object
        })

        user.save().then((u) => {
            return res.status(200).json(formatDataToSend(u))
        })
        .catch(err => {

            if(err.code == 11000){
                return res.status(500).json({"Error":"Email already exists"})
            }

            return res.status(500).json({"error":err.message});
        })
        console.log(hashedPw);
    })

})


server.post("/sign-in", (req,res) => {

    let { email, password } = req.body;

    User.findOne({ "personal_info.email" : email })
    .then((user) => {

        if(!user){
            return res.status(403).json({"Error":"Email not found"});
        }
        
        bcrypt.compare(password, user.personal_info.password, (err,result) => {
            if(err){
                return res.status(403).json({"Error":"Error occured while logging in, please try again."})
            }

            if(!result){
                return res.status(403).json({"Error":"Incorrect password"});
            }else {
                return res.status(200).json(formatDataToSend(user));
            }
        })

        //return res.json({"status":"Got user document"})
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({"Error":err.message});
    })
    
})


server.listen(PORT, ()=>{
    console.log('listening on port -> ' + PORT)
});