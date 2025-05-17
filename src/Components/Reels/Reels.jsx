import React, { useEffect, useRef, useState } from 'react'
import './Reels.css'
import SideBar from '../SideBar/SideBar'
import api from '../../api/axiosConfig'
import OverlayPost from '../OverlayPost/OverlayPost'
import Cookies from 'js-cookie'
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'
import ReactPlayer from 'react-player'
import { useInView } from 'react-intersection-observer'
import { FaBookmark, FaHeart, FaPaperPlane, FaPause, FaPlay, FaRegBookmark, FaRegComment, FaRegHeart, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import { Avatar } from '@mui/material'
import ApiFunctions from '../../ApiFunctions'
import Functions from '../../Functions'
import ImageLoading from '../../Others/ImageLoading'

const Reels = () => {

  const [allpost, setAllPost] = useState()
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const {toGetAllPosts} = ApiFunctions();
  const {shuffleArray} = Functions()

  // const getData
  const getData = async () => {
    const response  = await toGetAllPosts({page: page, size: 10, id: Cookies.get("_id"), isReels: true})
    
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

  useEffect(()=>{
      getData()
  },[])
  return (
    <div>
        <div className='reels'>
            {/* Reels Side bar */}
            <div className='reels_sidebar'>
                <SideBar/>
            </div>
            <div className='reels_content'>
                <div className='reels_cards'>
                  {allpost?.map((post,index)=>{
                    return(
                      <div key={index} ref={index === allpost.length - 1 ? lastPostRef : null}>
                          <ReelsPost postid={post}/>
                      </div>
                    )})}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Reels

const ReelsPost = ({postid}) =>{ 
  
  const [post, setpost] = useState()
  const [user, setuser] = useState()
  const [postuser, setpostuser] = useState()
  const [intraction, setintraction] = useState()
  const { toGetPost, toGetUserData, forPostIntraction, forFriendIntractions, toSavePost } = ApiFunctions();
  const [loader, setloader] = useState(false)
  const getData= async()=>{
    setloader(true)
    try {
      const response = (await toGetPost({postId: postid})).data.data
      setpost(response)
      setintraction(response)
      setpostuser((await toGetUserData({id: response?.userId})).data.data)
      setloader(false)
    } catch (error) {
      
    }
  }

  const getIntraction = async()=>{
    try {
      setintraction((await toGetPost({postId: postid})).data.data)
      setpostuser((await toGetUserData({id: post?.userId})).data.data)
    } catch (error) {
      
    }
  }

  const getUser = async()=>{
    try {
      setuser((await toGetUserData({id: Cookies.get("_id")})).data.data)
    } catch (error) {
      
    }
  }

  // Post Intraction
  const postIntraction = async () =>{
    await forPostIntraction({postId: post?.id, userId: user?.id})
    getIntraction()
  }

  const [play, setplay] = useState(true)
  const [mute, setmute] = useState(false)
  const videoRef = useRef()
  const { ref, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
      
      if (videoRef.current) {
          if (inView) {
              if (!videoRef.current.isPlaying()) {
                  videoRef.current.play();
                  setplay(true);
                  if (mute) {
                      videoRef.current.mute();
                  }
              }
          } else {
              videoRef.current.pause();
              setplay(false);
          }
      }
      
  }, [inView, mute]);

  // User Friend Intractions
  const userFriend= async (friendUserid)=>{
    await forFriendIntractions({userId: user?.id, userFriendId: friendUserid})
    getUser()
  }
  // SavePost
  const savePost= async()=>{
    await toSavePost({postId: post?.id, userId: user?.id})
    getUser()
}

  useEffect(()=>{
    getData()
    getUser()
  },[])



  // to Open Each post
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [overlaypost, setoverlaypost] = useState(false);
  const handleOverlayPost = (postId) => {
      setSelectedPostId(postId); 
      setoverlaypost(true); 
  }
  const handleCloseOverlay = () =>{
    setoverlaypost(false)
    setTimeout(() => {
      setplay(true)
    }, 500);
  }

  return(
    <div className='reels_card'>
      {overlaypost && selectedPostId && (
          <OverlayPost postid={selectedPostId} onClose={handleCloseOverlay} className='post_overlaypost' />
      )}

      <div className='reels_media' ref={ref}>
          {/* Reels Container Left */}
          <div className='reels_container_left'>
              {loader ? <ImageLoading/> :
                <LazyLoadComponent>
                    <div style={{borderRadius:'8px', overflow:'hidden',position:'relative'}} className='reels_container_left_'>
                        <ReactPlayer
                            url={post?.postURL}
                            playing={play && inView }
                            loop
                            muted={mute}
                            width={'var(--reels-width)'}
                            height={'var(--reels-height)'}
                            onClick={()=>{setmute(pre=> !pre)}}
                            pip={false}
                            className="reels_container_left__"
                        />
                        <p className='play_button' onClick={()=>setplay(pre=> !pre)}>{play && inView ?<FaPause/>:<FaPlay/>}</p>
                        <div className='reels_intraction_div'>                         
                            <div className='reels_card_container'>
                              <div className='reels_card_top'>
                                  <a href={`/account/profile/${postuser?.id}/`}>
                                      <Avatar style={{width:'32px',height:'32px'}} className='top_avatar'>
                                          <LazyLoadImage
                                              key={post?.userId}
                                              width={32}
                                              height={32}
                                              src={postuser?.profileURL ? postuser?.profileURL : '/profile.png'}
                                              effect={'blur'}
                                              placeholderSrc={postuser?.profileURL ? postuser?.profileURL : '/profile.png'}
                                              className='top_avatar'
                                          />
                                      </Avatar>
                                  </a>
                                  
                                  <div className='reels_username'>
                                      <p>{postuser?.userName} • <button onClick={()=> userFriend(postuser?.id)}>{user?.userFollowings?.includes(postuser?.id)?<span>Unfollow</span>:<span>Follow</span>}</button></p>
                                  </div>
                              </div>
                              <div className='reels_card_bottom'>
                                <p>{post?.postDescription}</p>
                              </div>
                            </div>
                        </div>
                    </div>
                </LazyLoadComponent>
              }
          </div>

          {/* Reels Container Right */}
          <div className='reels_container_right'>
            <div className='reels_intraction'>
                <p onClick={postIntraction}>{intraction?.postLikes.includes(user?.id)  ?<FaHeart style={{color:'red'}}/>:<FaRegHeart/>}<span>{intraction?.postLikes === null ? 0 : intraction?.postLikes?.length}</span></p>
                <p onClick={() => {handleOverlayPost(intraction?.id); setplay((prev)=> !prev)}}><FaRegComment/><span>{intraction?.postComments === null ? 0 : intraction?.postComments?.length}</span></p>
                <p><FaPaperPlane/></p>
                <p onClick={savePost}>{user?.savedPost && user?.savedPost?.includes(intraction?.id)? <FaBookmark/> : <FaRegBookmark/>}</p>
                <p><BsThreeDots/></p>
            </div>
          </div>
      </div>

    </div>
  )
}

