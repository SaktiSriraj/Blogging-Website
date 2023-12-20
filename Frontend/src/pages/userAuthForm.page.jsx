import axios from "axios"; //server access
import { useContext } from "react"; //used to access an HTML element
import { Toaster, toast } from "react-hot-toast"; //to create alert-ui
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import { storeInSession } from "../common/session";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { authWithGoogle } from "../common/firebase";

    
const UserAuthForm = ({type}) => {

    let { userAuth: { accessToken }, setUserAuth } = useContext(UserContext)

    //Send the data to backend server
    const userAuthThroughServer = (serverRoute, formData) => {
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({ data }) => {
            storeInSession("user", JSON.stringify(data))
            setUserAuth(data)
        })
        .catch(({ response }) => {
            toast.error(response.data.error)
        })

    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let serverRoute = type == "sign-in" ? "/sign-in" : "/sign-up";

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        //Form Data
        let form = new FormData(formElement);
        let formData = {}

        for(let [key, value] of form.entries()) {
            formData[key] = value;
        }

        //Destructure formData
        let { fullname, email, password } = formData
 
        //Form Validations
        if(fullname){
            if(fullname.length < 3){
                return toast.error("Fullname must be ateast 3 letters long")
            }
        }
    
        if(!email.length){
            return toast.error("Enter email address");
        }
    
        if(!emailRegex.test(email)){
            return toast.error("Enter a valid email address");
        }

        if(!password.length){
            return toast.error("Enter password");
        }
    
        if(!passwordRegex.test(password)){
            return toast.error("Password must be at 6 - 20 characters long, with atleast one lowercase character, one uppercase character and a numeric character");
        }

        userAuthThroughServer(serverRoute, formData);

    }

    const handleGoogleAuth = (e) => {

        e.preventDefault();

        authWithGoogle().then(user => {
            console.log(user);
        })
        .catch(err => {
            toast.error("There was a problem logging in")
            return console.log(err);
        })

    }

    return (
        accessToken ?
            <Navigate to="/" />
            //If we have a access token, then a user is already in session and we won't be redirected to sign-in page, rather we will be redirected to the home page
        :
            <AnimationWrapper keyValue={type}>

                <section className="h-cover flex items-center justify-center">
                    <Toaster />
                    <form id="formElement" className="w-[80%] max-w-[400px]">

                        <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                            {type == "sign-in" ? "Welcome Back" : "Join Us Today"}
                        </h1>

                        {
                            type != "sign-in" ?
                                <InputBox
                                    name="fullname"
                                    type="text"
                                    placeholder="Full Name"
                                    icon="fi-rr-user"
                                />
                            :
                                ""
                        }

                        <InputBox
                            name="email"
                            type="email"
                            placeholder="Email"
                            icon="fi-rr-envelope"
                        />

                        <InputBox
                            name="password"
                            type="password"
                            placeholder="Password"
                            icon="fi-rr-key"
                        />

                        <button
                            className=" btn-dark mt-14 w-[25%] flex items-center justify-center center "
                            type="submit" onClick={handleSubmit}>

                            {type.replace("-", " ")}
                        </button>

                        
                        <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                            <hr className="w-1/2 border-black"/>
                            <p>or</p>
                            <hr className="w-1/2 border-black"/>
                        </div>
                        
                        {/* Logging in with Google */}
                        <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center " onClick={handleGoogleAuth}>
                            <img src={googleIcon} className="w-5" />
                            Continue with google
                        </button>

                        {
                            type=="sign-in" ?
                                <p className="mt-6 text-dark-grey text-xl text-center">
                                    Don't have an account?
                                    <Link to="/sign-up" className="underline text-black text-xl ml-1">
                                        Join Here
                                    </Link>
                                </p>
                            :
                                <p className="mt-6 text-dark-grey text-xl text-center">
                                    Already a member?
                                    <Link to="/sign-in" className="underline text-black text-xl ml-1">
                                        Sign in Here
                                    </Link>
                                </p>

                        }
                        


                    </form>

                </section>

            </AnimationWrapper>
    );
}

export default UserAuthForm;