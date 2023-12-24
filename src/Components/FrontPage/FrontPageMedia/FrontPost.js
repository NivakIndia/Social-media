import React, { useEffect, useRef, useState } from 'react'
import api from '../../../api/axiosConfig'
import './FrontPost.css'
import { DotLoader } from 'react-spinners'
import { Avatar } from '@mui/material'
import { BsThreeDots } from "react-icons/bs";
import { FaHeart, FaPaperPlane, FaPause, FaPlay, FaRegBookmark, FaRegComment, FaRegHeart, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'
import { useInView } from 'react-intersection-observer'
import ReactPlayer from 'react-player'
import Cookies from 'js-cookie'
import OverlayPost from '../../OverlayPost/OverlayPost'

const FrontPost = ({post}) => {
    const [loadingpart, setloadingpart] = useState(true);

    const [user,setuser] = useState()
    const [isUser, setisUser] = useState()
    const [isPost, setisPost] = useState()
    const [comment, setcomment] = useState('')

    // get Time from present
    const getTimeDifference = (targetDate, targetTime) => {
        const currentDate = new Date();
        const providedDate = new Date(`${targetDate}T${targetTime}`);
        const timeDifference = currentDate - providedDate;
    
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
    
        if (seconds < 60) {
          return `${seconds}s`;
        } else if (minutes < 60) {
          return `${minutes}min`;
        } else if (hours < 24) {
          return `${hours}h`;
        } else if (days < 30) {
          return `${days}d`;
        } else if (months < 12) {
          return `${months}m`;
        } else {
          return `${years}y`;
        }
    };

    // Get User data from api
    const getUser=async()=>{
        try {
            const user = await api.get(`/nivak/media/byuserid/${post?.userId}/`)
            setuser(user.data)
            const isUser = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
            setisUser(isUser.data)
        } catch (error) {
            
        }
    }

    const getPost = async()=>{
        try {
            const ispost = await api.get(`/nivak/media/postbypostid/${post?.postId}/`)
            setisPost(ispost.data)
        } catch (error) {
            
        }
    }

    // Check post is image or video
    const isImage = post?.postURL && (post.postURL?.includes('.jpg') || post?.postURL.includes('.png') || post?.postURL.includes('.jpeg'));
    const isVideo = post?.postURL && (post?.postURL.includes('.mp4') || post?.postURL.includes('.mov') || post?.postURL.includes('.avi'));


    //Video Controlls
    
    const [play, setplay] = useState(true)
    const [mute, setmute] = useState(false)
    const videoRef = useRef()
    const { ref, inView } = useInView({ threshold: 0.5 });

    useEffect(() => {
        if (isVideo) {
            if (videoRef.current) {
                if (inView) {
                    if (!videoRef.current.isPlaying()) {
                        videoRef.current.play();
                        setplay(true);
                        if (mute) {
                            videoRef.current.mute(); // Unmute the video if mute state is false
                        }
                    }
                } else {
                    videoRef.current.pause();
                    setplay(false);
                }
            }
        }
    }, [inView, mute]);


    // handle Comment input
    const handleComment=(event)=>{
        setcomment(event.target.value)
    }
    
    // Check if image loaded
    const handleLoad=()=>{
        setloadingpart(false)
    }


    // Post Intraction
    const postIntraction = async () =>{
        const formData = new FormData()
        try {
            formData.append('postid',post?.postId)
            formData.append('userid',isUser?.userId)
            const response = await api.post('/nivak/media/intraction/',formData,{
                headers: {
                    'Content-Type' : 'form-data',
                }
            })
            getPost()
        } catch (error) {
        }
    }

    // Post Comment
    const postComment = async () => {
        const formData = new FormData()
        try {
            formData.append('postid',post?.postId)
            formData.append('userid',isUser?.userId)
            formData.append('comment',comment)
            const response = await api.post('/nivak/media/postcomment/',formData,{
                headers: {
                    'Content-Type' : 'form-data',
                }
            })
            getPost()
            setcomment('')
        } catch (error) {
        }
    }

    // to Open Each post
    const [selectedPostId, setSelectedPostId] = useState(null); // To store the selected postId
    const [overlaypost, setoverlaypost] = useState(false);
    const handleOverlayPost = (postId) => {
        setSelectedPostId(postId); // Set the selected postId
        setoverlaypost(true); // Open the OverlayPost component
        setplay(false)
    }

    const handleCloseOverlay = () =>{
        setoverlaypost(false)
        setplay(true)
    }

    // useEffects
    useEffect(()=>{
        getUser()
        getPost()
    },[])
    
    
  return (
    <div>
        {overlaypost && selectedPostId && (
          <OverlayPost postid={selectedPostId} onClose={handleCloseOverlay} className='post_overlaypost' />
        )}
        <div className='frontpost_card' ref={ref}>

            {/* Frontpost Top */}
            <div className='frontpost_card_top_'>
                <div className='frontpost_card_top'>
                    <a href={`/account/profile/${user?.userName}/`}>
                        <Avatar style={{width:'32px',height:'32px'}}>
                            <LazyLoadImage
                                key={post?.userId}
                                width={32}
                                height={32}
                                src={user?.profileURL ? user?.profileURL : '/profile.png'}
                                effect={'blur'}
                                placeholderSrc={user?.profileURL ? user?.profileURL : '/profile.png'}
                                className='top_avatar'
                            />
                        </Avatar>
                    </a>
                    
                    <div className='frontpost_username'>
                        <p>{user?.userName} <span>• {getTimeDifference(post?.postDate, post?.postTime)}</span></p>
                    </div>
                    <p><BsThreeDots/></p>
                </div>
            </div>

            {/* Frontpost Middle */}
            <div className='frontpost_card_middle_'>
                {isImage && (
                    <>
                        <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'470px',height:'813px', position:'relative'} : { display: 'none' }}>
                            <DotLoader
                            size={50}
                            color={'#ffffff'}
                            loading={loadingpart}
                            />
                        </div>
                        <LazyLoadImage
                            key={post?.userId}
                            width={470}
                            src={post?.postURL}
                            onLoad={handleLoad}
                            effect={'blur'}
                            placeholderSrc={post?.postURL}
                            className='post_media'
                        />
                    </>
                )}

                {isVideo && (
                    <>
                        <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'470px',height:'586.33px',position:'absolute'} : { display: 'none' }}>
                            <DotLoader
                            size={50}
                            color={'#ffffff'}
                            loading={loadingpart}
                            />
                        </div>
                        <div>
                            <LazyLoadComponent>
                                {/*<video ref={videoRef} autoPlay loop muted playsInline style={{width:'470px',height:'586.33px'}} onLoadedMetadata={handleLoad}>
                                    <source src={post?.postURL} type='video/mp4' />
                                    Your browser does not support the video tag.
                                </video>*/}
                                <div>
                                    <ReactPlayer
                                        url={post?.postURL}
                                        playing={play && inView }
                                        loop
                                        muted={mute}
                                        width={'470px'}
                                        height={'586.33px'}
                                        onReady={() => {
                                            handleLoad()
                                        }}
                                    />
                                </div>
                            </LazyLoadComponent>
                        </div>
                        <div className='button_play_mute'>
                        <p className='button_play' onClick={()=>setplay(pre=> !pre)}>{play && inView ?<FaPause/>:<FaPlay/>}</p>
                        <p className='button_play' onClick={()=>{setmute(pre=> !pre)}}>{mute?<FaVolumeUp/>:<FaVolumeMute/>}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Frontpost Bottom */}
            <div className='frontpost_card_bottom_'>

                <div className='frontpost_card_bottom_intraction'>
                    <div className='left_intraction'>
                        <p onClick={postIntraction}>{isPost?.postLikes.includes(isUser?.userId)  ?<FaHeart style={{color:'red'}}/>:<FaRegHeart/>}</p>
                        <p onClick={() => handleOverlayPost(post?.postId)}><FaRegComment/></p>
                        <p><FaPaperPlane/></p>
                    </div>
                    <div className='right_intraction'>
                        <p><FaRegBookmark/></p>
                    </div>
                </div>

                <div className='frontpost_card_bottom_likes'>
                    {isPost?.postLikes && <p>{isPost?.postLikes?.length} likes</p>}
                </div>

                <div className='frontpost_card_bottom_description'>
                    {post?.postDescription !== ''?(<p>{user?.userName} : <span>{post?.postDescription}</span></p>):(<p>{user?.userName}</p>)}
                </div>

                <div className='frontpost_card_bottom_viewcomment'>
                    {
                        isPost?.postComments?.length>0 ? 
                        <p onClick={() => handleOverlayPost(post?.postId)}>View all <span>{isPost?.postComments?.length} Comments... </span></p>:<></>
                    }
                </div>

                <div className='frontpost_card_bottom_addcomment'>
                    <input type='text' value={comment} onChange={handleComment} placeholder='Add a comment...'/>{comment !=='' && <button onClick={postComment}>post</button>}
                </div>
            </div>
        </div>
    
    </div>
  )
}

export default FrontPost


  
