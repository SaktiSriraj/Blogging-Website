import { Route, Routes } from "react-router-dom"
import Navbar from "./components/navbar.component"
import UserAuthForm from "./pages/userAuthForm.page";
import { lookInSession } from "./common/session";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({})

const App = () => {
    
    const [userAuth, setUserAuth] = useState({});

    useEffect(() => {

        let userInSession = lookInSession("user");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({access_token: null})

    }, [])
    
    return (
        <UserContext.Provider value={{userAuth, setUserAuth}}>
            
            <Routes>
            {/* Parent: Home + Navbar */}
                <Route path="/" element={ <Navbar /> }> 

                    {/*  / + sign-up => /sign-up */}
                    <Route path="sign-in" element={ <UserAuthForm type="sign-in" /> } />
                    <Route path="sign-up" element={ <UserAuthForm type="sign-up" /> } />

                </Route>

            </Routes>

        </UserContext.Provider>

    )
}

export default App;