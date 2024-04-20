import bcrypt from "bcrypt"; //used for password encryption
import cors from 'cors';
import 'dotenv/config';
import express from "express";
import admin from "firebase-admin"; //Firebase admin to access firebase from the server side
import { getAuth } from "firebase-admin/auth";
import jwt from 'jsonwebtoken'; //to create access token
import mongoose from "mongoose";
import { nanoid } from 'nanoid'; //gives random unique string
import User from './Schema/User.js'; //Schema
import Blog from './Schema/Blog.js'; 
import serviceAccountKey from "./fullstack-blogging-site.json" assert { type: "json" };
import aws from "aws-sdk";

const server = express();
let PORT = 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors()); //this lets the server to accept request from any port number along with th default

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
})

//setting up s3 bucket
const s3 = new aws.S3({
    region: process.env.BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
});

const generateUploadURL = async () => {

    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject',{
        Bucket : 'blogging-website-sdev',
        Key : imageName,
        Expires : 1000,
        ContentType: 'image/jpeg'
    });

}

//JWT Verification
const verifyJWT = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]

    if(token == null){
        return res.status(401).json({ error: "No acces token" })
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if(err){
            return res.status(403).json({ error: "Access Token is invalid" })
        }

        req.user = user.id
        next()
    })

}

//data formatting
const formatDataToSend = (user) => {

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)

    //Access token is stored in the user's browser session to validate the user login everytime the user accesses the website so that we don't have to ask the user to login everytime to make request.

    return {
        accessToken,
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

//upload image url root
server.get('/get-upload-url', (req, res) => {
    generateUploadURL().then(url => res.status(200).json({uploadUrl : url}))
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({error : err.message});
    })
})

//sign-up
server.post("/sign-up", (req, res) => {

    let { fullname, email, password } = req.body

    //Validating data from Frontend
    if(fullname.length < 3){
        return res.status(403).json({"error" : "Fullname must be ateast 3 letters long"})
    }

    if(!email.length){
        return res.status(403).json({"error" : "Enter email address"});
    }

    if(!emailRegex.test(email)){
        return res.status(403).json({"error" : "Enter a valid email address"});
    }

    if(!password.length){
        return res.status(403).json({"error" : "Enter a valid password"});
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

//sign-in
server.post("/sign-in", (req, res) => {

    let { email, password } = req.body;

    User.findOne({ "personal_info.email": email })
    .then((user) => {
        if(!user){
            return res.status(403).json({ "error": "Email not found"})
        }

        if(!user.google_auth){
            
            bcrypt.compare( password, user.personal_info.password, (err,result) => {
                if(err){
                    return res.status(403).json({ "error": "Error occured while login. Please try again."})
                }
    
                if(!result){
                    return res.status(403).json({ "error": "Incorrect Password"})
                }else{
                    return res.status(200).json(formatDataToSend(user));
                }
            })

        }else {
            return res.status(403).json({ "error": "Account was created using Google. Try logging in with Google account"});
        }

        

    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ "error": err.message})
    })

})

//Google Auth
server.post("/google-auth", async (req, res) => {

    let { accessToken } = req.body;

    getAuth()
    .verifyIdToken(accessToken)
    .then(async (decodedUser) => {
        
        let { email, name, picture } = decodedUser

        picture = picture.replace("s96-c", "s384-c")

        let user = await User.findOne({"personal_info.email":email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((u) => {
            return u || null
        })
        .catch(err => {
            return res.status(500).json({ "error": err.message })
        });
        
        if(user){ //login
            if(!user.google_auth){
                return res.status(403).json({ "error": "This is email was signed up without Google. Please login with password to access your account" })
            }
        }else { //sign-up
            
            let username = await generateUsername(email);

            user = new User({
                personal_info: { fullname: name, email, username},
                google_auth: true
            })

            await user.save().then((u) => {
                user = u;
            })
            .catch(err => {
                return res.status(500).json({ "error": err.message })
            })

        }

        return res.status(200).json(formatDataToSend(user));
    
    })
    .catch(err => {
        return res.status(500).json({ "error": "Failed to authenticate, try with another account." })
    })

})

// Sending blog data from frontend to backend
server.post('/create-blog', verifyJWT, (req, res) => {

    let authorId = req.user;

    let { title, des, banner, tags, content, draft } = req.body;
    
    if(!title.length){
        return res.status(403).json({ error: "You must provide a Title for the Blog" })
    }

    if(!draft){
    
        if(!des.length || des.length > 200){
            return res.status(403).json({ error: "You must provide a Blog Description" })
        }
    
        if(!banner.length){
            return res.status(403).json({ error: "You must provide Blog Banner to Publish the Blog" })
        }
    
        if(!content.blocks.length){
            return res.status(403).json({ error: "There must be some Blog Content to Publish" })
        }
    
        if(!tags.length || tags.length > 10){
            return res.status(403).json({ error: "Provide at Max 10 Tags to Publish"})
        }

    }

    tags = tags.map( tag => tag.toLowerCase())

    let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g,"-").trim() + nanoid();

    let blog = new Blog({
        title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)
    })

    blog.save().then(blog => {

        let incrementVal = draft ? 0 : 1;
        User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts" : incrementVal }, $push: { "blogs" : blog._id } })
        .then(user => {
            return res.status(200).json({ id: blog.blog_id })
        })
        .catch(err => {
            return res.status(500).json({ error : "Failed to Update total posts number" })
        })

    })
    .catch(err => {
        return res.status(500).json({ error : err.message })
    })

})

server.listen(PORT, ()=>{
    console.log('listening on port -> ' + PORT)
});