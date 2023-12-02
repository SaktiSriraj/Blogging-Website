import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";

const UserAuthForm = ({type}) => {
    return (
        <section className="h-cover flex items-center justify-center">

            <form className="w-[80%] max-w-[400px]">

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

                <buton className=" btn-dark mt-14 w-[25%] flex items-center justify-center center " type="submit">
                    {type.replace("-", " ")}
                </buton>

                
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
    );
}

export default UserAuthForm;