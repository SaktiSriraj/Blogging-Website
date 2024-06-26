import { Link, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png"
import { uploadImage } from "../common/aws";
import { useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import { useEffect } from "react";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {

    let { blog, blog: { title, banner, content, tags, des }, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);

    let { userAuth: {accessToken} } = useContext(UserContext)
    let navigate = useNavigate()

    //useEffect hook
    useEffect(() => {
        if(!textEditor.isReady){
            setTextEditor(new EditorJS({
                holderId: "textEditor", //id of the portion that we want to act as our text editor
                data: content,
                tools: tools, //adding text-editing tools to the editor
                placeholder: 'Compose Your Masterpiece', //initially we got this 2 times because react renders everything twice
            }))
        }
    }, [])

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];

        if (img) {

            let loadingToast = toast.loading("Uploading...");

            uploadImage(img).then((url) => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded Successfully");

                    setBlog({ ...blog, banner: url })//this will give you the banner of the blog in the context provider. 
                }
            })
                .catch(err => {
                    toast.dismiss(loadingToast);
                    return toast.error(err);
                })
        }
    }


    //shows default banner initially instead of alt-image / err-image
    const handleError = (e) => {
        let img = e.target;
        img.src = defaultBanner;
    }

    // Prevents Enter Key Action
    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target;

        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";

        setBlog({ ...blog, title: input.value })//this will give you the title of the blog in the context provider. 
    }

    //to change the state from editor to publish form
    const handlePublishEvent = () => {
        
        if(!banner.length){
            return toast.error("Please upload a blog banner image to publish");
        }

        if(!title.length){
            return toast.error("Please enter a title for your blog");
        }

        if(textEditor.isReady){
            textEditor.save().then(data => {
                if(data.blocks.length){
                    setBlog({ ...blog, content: data });
                    setEditorState("publish")
                }else{
                    return toast.error("Blog content cannot be empty");
                }
            })
            .catch((err) => {
                return toast.error(err);
            })
        }
    }

    const handleSaveDraft = (e) => {
        if(e.target.className.includes("disable")){
            return;
        }

        if(!title.length){
            return toast.error("Blog Title cannot be Empty before Saving as Draft")
        }
 
        let loadingToast = toast.loading("Saving Draft...")

        e.target.classList.add('disable');

        if(textEditor.isReady){
            textEditor.save().then( content => {

                let blogObj = {
                    title, banner, des, content, tags, draft: true
                }

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                .then(() => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
                    toast.success("Draft Saved Successfully");
                    setTimeout(() => {
                        navigate("/")
                    }, 500)
                })
                .catch(( { response } ) => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
        
                    return toast.error(response.data.error)
                })
            })
        }

        

        
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {title.length ? title : "New Blog"}
                </p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2"
                        onClick={ handlePublishEvent }>
                        Publish
                    </button>
                    <button className="btn-light py-2" onClick={handleSaveDraft}>Save Draft</button>
                </div>
            </nav>

            <Toaster />

            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        {/* Blog banner */}
                        <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                            <label htmlFor="uploadBanner">
                                <img
                                    src={banner}
                                    className="z-20"
                                    onError={handleError}
                                />
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea defaultValue={ title } placeholder="Blog Title" className="text-4xl font-md w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40" onKeyDown={handleTitleKeyDown} onChange={handleTitleChange}>

                        </textarea>
                        <hr className="w-full opacity-20 my-5" />

                        {/* Content of the blog */}
                        {/* We are using EditorJS class to write the content */}
                        <div id="textEditor" className="font-gelasio"></div>

                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor;