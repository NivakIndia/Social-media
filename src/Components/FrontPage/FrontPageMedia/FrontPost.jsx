import React, { useEffect, useRef, useState } from 'react'
import api from '../../../api/axiosConfig'
import './FrontPost.css'
import { Avatar } from '@mui/material'
import { BsThreeDots } from "react-icons/bs";
import { FaBookmark, FaHeart, FaPaperPlane, FaPause, FaPlay, FaRegBookmark, FaRegComment, FaRegHeart, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'
import { useInView } from 'react-intersection-observer'
import ReactPlayer from 'react-player'
import Cookies from 'js-cookie'
import OverlayPost from '../../OverlayPost/OverlayPost'
import SockJS from 'sockjs-client'
import { Stomp } from 'stompjs/lib/stomp'
import ApiFunctions from '../../../ApiFunctions';
import Functions from '../../../Functions';
import ImageLoading from '../../../Others/ImageLoading';

const FrontPost = ({ post }) => {
    const { toGetUserData, toGetPost, forPostIntraction, forPostComment, toSavePost } = ApiFunctions()
    const { toGetTimeDifference, toCheckIsImage, toCheckIsVideo } = Functions();

    const [user, setuser] = useState()
    const [isPost, setisPost] = useState()
    const [isImage, setisImage] = useState(false)
    const [isVideo, setisVideo] = useState(false)
    const [loading, setloading] = useState(false)

    // get Time from present
    const getTimeDifference = (targetDate, targetTime) => {
        return toGetTimeDifference({ targetDate: targetDate, targetTime: targetTime, fullFormat: false })
    };

    // Get User data from api
    const getUser = async () => {
        setuser((await toGetUserData({ id: post.userId })).data.data)
    }

    const getPost = async () => {
        setloading(true)

        const isPost = (await toGetPost({ postId: post.id })).data.data

        setisPost(isPost);
        setisImage(toCheckIsImage({ url: isPost?.postURL }));
        setisVideo(toCheckIsVideo({ url: isPost?.postURL }));

        setloading(false)
    }


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


    // to Open Each post
    const [selectedPostId, setSelectedPostId] = useState(null); // To store the selected postId
    const [overlaypost, setoverlaypost] = useState(false);
    const handleOverlayPost = (postId) => {
        setSelectedPostId(postId); // Set the selected postId
        setoverlaypost(true); // Open the OverlayPost component
        setplay(false)
    }

    const handleCloseOverlay = () => {
        setoverlaypost(false)
        setplay(true)
    }


    // useEffects
    useEffect(() => {
        getUser();
        getPost();
    }, []);


    return (
        <div>
            {overlaypost && selectedPostId && (
                <OverlayPost postid={selectedPostId} onClose={handleCloseOverlay} className='post_overlaypost' />
            )}
            <div className='frontpost_card' ref={ref}>

                {/* Frontpost Top */}
                <div className='frontpost_card_top_'>
                    <div className='frontpost_card_top'>
                        <a href={`/account/profile/${user?.id}/`}>
                            <Avatar style={{ width: '32px', height: '32px' }}>
                                <LazyLoadImage
                                    key={isPost?.userId}
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
                            <p>{user?.userName} <span>• {getTimeDifference(isPost?.postDate, isPost?.postTime)}</span></p>
                        </div>
                        <p><BsThreeDots /></p>
                    </div>
                </div>

                {/* Frontpost Middle */}
                <div className='frontpost_card_middle_'>
                    {
                        loading ? (
                            <div style={{ width: '470px', height: '586.33px' }}><ImageLoading isBackground={true} /></div>

                        ) :
                            (<>
                                {isImage && (
                                    <img src={isPost?.postURL} className='post_media' alt="" srcSet="" />
                                )}

                                {isVideo && (
                                    <>
                                        <div>
                                            <LazyLoadComponent>
                                                {/*<video ref={videoRef} autoPlay loop muted playsInline style={{width:'470px',height:'586.33px'}} onLoadedMetadata={handleLoad}>
                                            <source src={post?.postURL} type='video/mp4' />
                                            Your browser does not support the video tag.
                                        </video>*/}
                                                <div className='post_media'>
                                                    <ReactPlayer
                                                        url={isPost?.postURL}
                                                        playing={play && inView}
                                                        loop
                                                        muted={mute}
                                                        width={'100%'}
                                                        height={'586.33px'}
                                                        className='post_media'
                                                    />
                                                </div>
                                            </LazyLoadComponent>
                                        </div>
                                        <div className='button_play_mute'>
                                            <p className='button_play' onClick={() => setplay(pre => !pre)}>{play && inView ? <FaPause /> : <FaPlay />}</p>
                                            <p className='button_play' onClick={() => { setmute(pre => !pre) }}>{mute ? <FaVolumeUp /> : <FaVolumeMute />}</p>
                                        </div>
                                    </>
                                )}</>
                            )
                    }
                </div>

                {/* Frontpost Bottom */}
                <FrontPostBottom post={post} handleOverlayPost={handleOverlayPost} />
            </div>

        </div>
    )
}

export default FrontPost


const FrontPostBottom = ({ post, handleOverlayPost }) => {

    const { toGetUserData, toGetPost, forPostIntraction, forPostComment, toSavePost } = ApiFunctions()
    const [isPost, setisPost] = useState()
    const [comment, setcomment] = useState('')
    const [isUser, setisUser] = useState()
    const [user, setuser] = useState()

    // handle Comment input
    const handleComment = (event) => {
        setcomment(event.target.value)
    }


    // Post Intraction
    const postIntraction = async () => {
        await forPostIntraction({ postId: isPost?.id, userId: isUser?.id })
        getPost()
    }

    // Post Comment
    const postComment = async () => {
        await forPostComment({ postId: isPost?.id, userId: isUser?.id, comment: comment })
        getPost()
        setcomment('')
    }

    // Save Post 
    const savePost = async () => {
        await toSavePost({ postId: isPost?.id, userId: isUser?.id })
        getPost()
        getUser()
    }

    const getUser = async () => {
        setuser((await toGetUserData({ id: post.userId })).data.data)
        setisUser((await toGetUserData({ id: Cookies.get('_id') })).data.data)
    }

    const getPost = async () => {
        const isPost = (await toGetPost({ postId: post.id })).data.data
        setisPost(isPost);
    }

    useEffect(() => {
        getUser();
        getPost();

        const socket = new SockJS(`${api.defaults.baseURL}/ws`);

        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            stompClient.subscribe("/function/intraction", (event) => {
                getPost();
            });
            stompClient.subscribe("/function/postcomment", (event) => {
                getPost();
            });
        });

    }, []);


    return (
        <div className='frontpost_card_bottom_'>

            <div className='frontpost_card_bottom_intraction'>
                <div className='left_intraction'>
                    <p onClick={postIntraction}>{isPost?.postLikes.includes(isUser?.id) ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />}</p>
                    <p onClick={() => handleOverlayPost(isPost?.id)}><FaRegComment /></p>
                    <p><FaPaperPlane /></p>
                </div>
                <div className='right_intraction'>
                    <p onClick={savePost}>{isUser?.savedPost && isUser?.savedPost?.includes(isPost?.id) ? <FaBookmark /> : <FaRegBookmark />}</p>
                </div>
            </div>

            <div className='frontpost_card_bottom_likes'>
                {isPost?.postLikes && <p>{isPost?.postLikes?.length} likes</p>}
            </div>

            <div className='frontpost_card_bottom_description'>
                {isPost?.postDescription !== '' ? (<p>{user?.userName} : <span>{isPost?.postDescription}</span></p>) : (<p>{user?.userName}</p>)}
            </div>

            <div className='frontpost_card_bottom_viewcomment'>
                {
                    isPost?.postComments?.length > 0 ?
                        <p onClick={() => handleOverlayPost(post?.id)}>View all <span>{isPost?.postComments?.length} Comments... </span></p> : <></>
                }
            </div>

            <div className='frontpost_card_bottom_addcomment'>
                <input type='text' value={comment} onChange={handleComment} placeholder='Add a comment...' />{comment !== '' && <button onClick={postComment}>post</button>}
            </div>
        </div>
    )
}



