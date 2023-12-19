import axios from "axios"; //server access
import { useRef } from "react"; //used to access an HTML element
import { Toaster, toast } from "react-hot-toast"; //to create alert-ui
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";

    
const UserAuthForm = ({type}) => {

    const authForm = useRef();

    const handleSubmit = (e) => {
        e.preventDefault();

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        //Form Data
        let form = new FormData(authForm.current);
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

    }

    return (
        <AnimationWrapper keyValue={type}>

            <section className="h-cover flex items-center justify-center">
                <Toaster />
                <form ref={authForm} className="w-[80%] max-w-[400px]">

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

                    <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center ">
                        <img src={googleIcon} className="w-5" />
                        continue with google
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