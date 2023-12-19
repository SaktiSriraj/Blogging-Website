import bcrypt from "bcrypt"; //used for password encryption
import cors from 'cors';
import 'dotenv/config';
import express from "express";
import jwt from 'jsonwebtoken'; //to create access token
import mongoose from "mongoose";
import { nanoid } from 'nanoid'; //gives random unique string
import User from './Schema/User.js'; //Schema

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})

//data formatting
const formatDataToSend = (user) => {
    return {
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

//username generation
const generateUsername = async (email) => {
    
    let username = email.split("@")[0];

    let usernameExists = await User.exists({ "personal_info.username" : username }).then((result) => result);

    usernameExists ? username += nanoid().substring(0,5) : "";

    return username;

}

server.post("/sign-up", (req, res) => {

    let { fullname, email, password } = req.body

    if(fullname.length < 3){
        return res.status(403).json({"error" : "Fullname must be ateast 3 letters long"})
    }

    if(!email.length){
        return res.status(403).json({"error" : "Enter email address"});
    }

    if(!emailRegex.test(email)){
        return res.status(403).json({"error" : "Enter a valid email address"});
    }

    if(!passwordRegex.test(password)){
        return res.status(403).json({"error":"Password must be at 6 - 20 characters long, with atleast one lowercase character, one uppercase character and a numeric character"});
    }

    //password encryption
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashedPassword, username }
        })

        user.save().then((u) => {
            return res.status(200).json(formatDataToSend(u))
        })
        .catch(err =>{

            if(err.code === 11000){
                return res.status(500).json({ "error" : "Email already exists" });
            }

            return res.status(500).json({ "error": err.message })
        })

    })

    
})
server.listen(PORT, ()=>{
    console.log('listening on port -> ' + PORT)
});