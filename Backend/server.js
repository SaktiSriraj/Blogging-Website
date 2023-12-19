import bcrypt from "bcrypt"; //used for password encryption
import cors from 'cors';
import 'dotenv/config';
import express from "express";
import jwt from 'jsonwebtoken'; //to create access token
import mongoose from "mongoose";
import { nanoid } from 'nanoid'; //gives random unique string
import User from './Schema/User.js';

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})

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
        return res.status(403).json({"error":"Password must be at 6 - 20 characters long, with atleast one lowercase character, one uppercase character and a number"});
    }

    return res.status(200).json({"Status" : "OK"})
    
})
server.listen(PORT, ()=>{
    console.log('listening on port -> ' + PORT)
});