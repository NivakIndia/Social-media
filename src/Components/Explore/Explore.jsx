import React, { useEffect, useRef, useState } from 'react'
import './Explore.css'
import api from '../../api/axiosConfig'
import SideBar from '../SideBar/SideBar'
import Cookies from 'js-cookie'
import OverlayPost from '../OverlayPost/OverlayPost'
import { DotLoader, SyncLoader } from 'react-spinners'
import { FaVideo } from 'react-icons/fa'
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'
import ApiFunctions from '../../ApiFunctions'
import Functions from '../../Functions'
import ImageLoading from '../../Others/ImageLoading'

const Explore = () => {
    const [allpost, setAllPost] = useState()
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const {toGetAllPosts} = ApiFunctions()
    const {shuffleArray} = Functions()

    // const getData
    const getData = async () => {
        const response  = await toGetAllPosts({page: page, size: 10, id: Cookies.get("_id"), isReels: false})
        
        const { content, last } = response.data

        const newPosts = shuffleArray(content);

        setAllPost((prevPosts) => {
            if (!prevPosts) return newPosts;
            const uniqueNewPosts = newPosts.filter(
                (newPost) => !prevPosts.includes(newPost)
            );
            return [...prevPosts, ...uniqueNewPosts];
        });

        setHasMore(!last);
    }

    const lastPostRef = (node) => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((prevPage) => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    };

    // to Open Each post
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [overlaypost, setoverlaypost] = useState(false);
    const handleOverlayPost = (postId) => {
        setSelectedPostId(postId);
        setoverlaypost(true);
    }

    useEffect(()=>{
        getData()
    },[page])

  return (
    <div>
        {overlaypost && selectedPostId && (
          <OverlayPost postid={selectedPostId} onClose={() => setoverlaypost(false)} className='post_overlaypost' />
        )}
        <div className='explore'>
            {/* Explore Side bar */}
            <div className='explore_sidebar'>
                <SideBar/>
            </div>

            {/* Explore Content */}
            <div className='explore_content'>
                <div className='explore_row'>
                    {allpost?.map((post,index)=>{
                        
                        return(
                            <div className='explore_column' key={index} ref={index === allpost.length - 1 ? lastPostRef : null}>
                                <div className='explore_cards'>
                                    <ExplorePosts isPost={post} handleOverlayPost={handleOverlayPost}/>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Explore

const ExplorePosts =({isPost, handleOverlayPost}) => {
    const { toGetPost } = ApiFunctions();
    const { toCheckIsImage, toCheckIsVideo } = Functions();

    const [post, setpost] = useState()
    const [isImage, setisImage] = useState(false)
    const [isVideo, setisVideo] = useState(false)
    const [loader, setloader] = useState(false)

    const getPostDetails = async () => {
        setloader(true)
        try {
        const post = await (await toGetPost({postId: isPost})).data.data
        
        setpost(post)
        
        setisImage(toCheckIsImage({url: post.postURL}))
        setisVideo(toCheckIsVideo({url: post.postURL}))
        setloader(false)
        
        } catch (error) {
        }
    }

    useEffect(() => {
      getPostDetails()
    }, [])
    
    return (
        <div className='explore_card' onClick={() => handleOverlayPost(post?.id)}>
            {
                loader ? <ImageLoading isBackground={true}/>
                :
                <>
                    {isImage && (
                        <div className='explore_card_'>
                            <LazyLoadImage
                                key={post?.userId}
                                width={300}
                                height={350}
                                src={post?.postURL}
                                effect={'blur'}
                                placeholderSrc={post?.postURL}
                                className='explore_media'
                            />
                        </div>
                    )}

                    {isVideo && (
                        <LazyLoadComponent>
                            <video loop muted className='explore_media'>
                                <source src={post?.postURL} type='video/mp4' />
                                Your browser does not support the video tag.
                            </video>
                            <p className='explore_media_icon'><FaVideo/></p>
                        </LazyLoadComponent>
                    )}
                </>
            }
        </div>
    )
}
