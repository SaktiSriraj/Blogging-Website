import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";

const HomePage = () => {

    let [blogs, setBlogs] = useState(null);
    let [trendingBlogs, setTrendingBlogs] = useState(null);

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs")
        .then(({ data }) => {
            setBlogs(data.blogs)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
        .then(({ data }) => {
            setTrendingBlogs(data.blogs)
        })
        .catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        fetchLatestBlogs();
        fetchTrendingBlogs();
    }, [])

    return (
        <AnimationWrapper>
            {/* Parent component that will contain the left and right side sections of the home-page */}
            <section className="h-cover flex justfy-center gap-10">
                {/* Latest Blogs */}
                <div className="h-full">

                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>

                        <>
                            {
                                blogs == null ? <Loader /> :
                                blogs.map((blog, i) => {
                                    return <AnimationWrapper transition={{ duration: 1, delay: i*.1 }} key={i}>
                                        <BlogPostCard content={blog} author={blog.author.personal_info} />
                                    </AnimationWrapper>
                                })
                            }
                        </>

                        {
                                trendingBlogs == null ? <Loader /> :
                                trendingBlogs.map((trendingBlogs, i) => {
                                    return <AnimationWrapper transition={{ duration: 1, delay: i*.1 }} key={i}>
                                        <MinimalBlogPost />
                                    </AnimationWrapper>
                                })
                            }

                        <h1>Trending Blogs Here</h1>
                    </InPageNavigation>

                </div>

                {/* Filters and Trending Blogs */}
                <div></div>
                
            </section>

        </AnimationWrapper>
    );
}

export default HomePage;