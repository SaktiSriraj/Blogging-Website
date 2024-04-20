import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import axios from 'axios';


const PublishForm = () => {

    let characterLimit = 200;
    let tagLimit = 10;

    let { blog, blog:{ banner, title, tags, des, content }, setEditorState, setBlog } = useContext(EditorContext);

    let { userAuth: { accessToken } } = useContext(UserContext)

    let navigate = useNavigate();

    const handleCloseEvent = () => {
        setEditorState("editor")
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;

        setBlog({...blog, title: input.value});
    }

    const handleBlogDesChange = (e) => {
        let input = e.target

        setBlog({...blog, des: input.value})
    }

    // Prevents Enter Key Action
    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    }

    // checks for `enter` and `comma`
    const handleKeyDown = (e) => {
        if (e.keyCode == 13 || e.keyCode == 188){
            e.preventDefault();

            let tag = e.target.value;

            if(tags.length < tagLimit){
                if(!tags.includes(tag) && tag.length){
                    setBlog({ ...blog, tags: [...tags, tag] })
                }else {
                    toast.error(`${tag} is already present`)
                }
            } else {
                toast.error(`You can add upto ${tagLimit} tags at max`)
            }

            e.target.value = "";
        }
    }

    const publishBlog = (e) => {
        
        if(e.target.className.includes("disable")){
            return;
        }

        if(!title.length){
            return toast.error("Blog Title cannot be Empty")
        }

        if(!des.length){
            return toast.error("Blog Description cannot be Empty")
        }

        if(des.length > 200){
            return toast.error("Blog Description should have atmost 200 Characters")
        }

        if(!tags.length){
            return toast.error("Mention at least 1 Tag to optimize Searching")
        }

        let loadingToast = toast.loading("Publishing...")

        e.target.classList.add('disable');

        let blogObj = {
            title, banner, des, content, tags, draft: false
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(() => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            toast.success("Published Successfully");
            setTimeout(() => {
                navigate("/")
            }, 500)
        })
        .catch(( { response } ) => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);

            return toast.error(response.data.error)
        })

    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">

                <Toaster />

                {/* close button */}
                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]" onClick={handleCloseEvent}>
                    <i className="fi fi-br-cross"></i>
                </button>

                {/* preview */}
                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1" >Preview</p>

                     {/* Holds Banner */}
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-3">
                        <img src = {banner} />
                    </div>

                    {/* Holds Title */}
                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2"> { title } </h1>

                    {/* Holds Description */}
                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{ des }</p>
                </div>

                {/* Section to add decsription, Last Minute changes, etc. */}
                <div className="border-grey lg:border-1 lg:pl-8">
                    {/* Title  */}
                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                    
                    <input type="text" placeholder="Blog Title" defaultValue={title} className="input-box pl-4" onChange={handleBlogTitleChange}/>
                    
                    {/* Description */}
                    <p className="text-dark-grey mb-2 mt-9">Short Description about your Blog</p>
                    
                    <textarea maxLength={characterLimit} defaultValue={des} className="h-40 resize-none eading-7 input-box" onChange={handleBlogDesChange} onKeyDown={handleTitleKeyDown}>
                    </textarea>

                    {/* Max Character Limit for Description */}
                    <p className="mt-1 text-dark-grey text-sm text-right">{ characterLimit - des.length }/200</p>

                    {/* Tags */}
                    <p className="text-dark-grey mb-2 mt-3">Tags - (Helps Searching and Ranking your Blog)</p>
                    
                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="Tags" className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white" onKeyDown={handleKeyDown} />
                        
                        { 
                            tags.map((tag, i) => {
                                return <Tag tag={tag} key={i} tagIndex={i} />
                            }) 
                        }

                    </div>
                    <p className="mt-1 mb-4 text-dark-grey text-right">{tagLimit - tags.length}/{tagLimit}</p>

                    <button className="btn-dark px-8" onClick={publishBlog}>Publish</button>
                
                </div>

            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;