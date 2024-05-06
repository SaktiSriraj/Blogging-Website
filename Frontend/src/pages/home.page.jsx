import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";

const HomePage = () => {
    return (
        <AnimationWrapper>
            {/* Parent component that will contain the left and right side sections of the home-page */}
            <section className="h-cover flex justfy-center gap-10">
                {/* Latest Blogs */}
                <div className="h-full">

                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>

                        <h1>Latest Blogs Here</h1>

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