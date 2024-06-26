import { useContext, useState } from 'react';
import { Link, Outlet } from "react-router-dom"; // Outlet: Render nested-route elements
import { UserContext } from '../App';
import logo from "../imgs/logo.png";
import UserNavigationPanel from './user-navigation.component';

const Navbar = () => {

    const [ searchBoxVisibility,setSearchBoxVisibility ] = useState (false);

    const [ userNavPanel, setUserNavPanel ] = useState (false);

    const { userAuth, userAuth: { accessToken, profile_img } } = useContext (UserContext);

    const handleUserNavpanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    }

    const handleBlur = () => {
        setTimeout(() => {
            setUserNavPanel(false);
        }, 300);
    }

    return (
        <>
        
            <nav className='navbar'>

                {/* logo */}
                <Link to="/" className='flex-none w-10'>
                    <img src={logo} className='w-full'/>
                </Link>

                {/* Search bar for lrge screen */}
                <div className={'absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show ' + (searchBoxVisibility?'show':'hide')}>
                    
                    <input type="text" placeholder='Search' className='w-full md:w-auto bg-grey p-4 pl-6 pr-[-12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12 '/>

                    <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
                
                </div>
                

                <div className='flex items-center gap-3 md:gap-6 ml-auto'>
                    
                    {/* Search bar for small screen */}
                    <button className='md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center' onClick={()=>setSearchBoxVisibility(currentVal => !currentVal)}>
                        <i className="fi fi-rr-search text-xl"></i>
                    </button>

                    {/* Write button */}
                    <Link to="/editor" className='hidden md:flex gap-2 link rounded-md'>
                        <i className="fi fi-rr-edit"></i>
                        <p>Create New</p>
                    </Link>

                    {
                        accessToken ?
                            <>

                                {/* notification button */}
                                <Link to="/dashboard/notification">
                                    <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                                        <i className="fi fi-rr-bell text-2xl block mt-2 text-dark-grey"></i>
                                    </button>
                                </Link>

                                {/* profile image */}
                                <div className='relative' onClick={handleUserNavpanel} onBlur={handleBlur}>
                                    <button className='w-12 h-12 mt-1'>
                                        <img src={profile_img} className='w-full h-full object-cover rounded-full' />
                                    </button>
                                    

                                    {
                                        userNavPanel ?
                                            <UserNavigationPanel />
                                        :
                                            ""
                                    }
                                    
                                </div>

                            
                            </>
                        :
                            // sign-in and sign-up button
                            <>
                                <Link className='btn-dark py-2.5' to="/sign-in">
                                    Sign in
                                </Link>


                                <Link className='btn-light py-2.5 hidden md:block' to="/sign-up">
                                    Sign up
                                </Link>
                            </>

                    }

                    

                </div>


            </nav>

            <Outlet />
        </>
    )
}

export default Navbar