import React, { useEffect, useState } from 'react'
import './OverlayPost.css'
import api from '../../api/axiosConfig'
import Cookies from 'js-cookie'
import { RxCross1 } from "react-icons/rx";
import { DotLoader, SyncLoader } from 'react-spinners'
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'
import { Avatar } from '@mui/material';
import { BsThreeDots } from 'react-icons/bs';
import { FaBookmark, FaHeart, FaPaperPlane, FaRegBookmark, FaRegComment, FaRegHeart } from 'react-icons/fa';
import CommentDetails from './Comment/CommentDetails';
import SockJS from 'sockjs-client'
import { Stomp } from 'stompjs/lib/stomp'

const OverlayPost = ({onClose,postid}) => {
    const [postuser, setpostuser] = useState()
    const [user, setuser] = useState()
    const [post, setpost] = useState()
    const [mute, setmute] = useState(false)

    const [loading, setloading] = useState()
    const [loadingpart, setloadingpart] = useState()

    // Get post by postid
    const getPost = async() => {
      try {
        const post = await api.get(`/nivak/media/postbypostid/${postid}/`)
        setpost(post.data)
        const postuser = await api.get(`/nivak/media/byuserid/${post?.data.userId}/`)
        setpostuser(postuser.data)
        setloading(false)
      } catch (error) {
        setloading(false)
      }
    }

    // Check post is image or video
    const isImage = post?.postURL && (post.postURL?.includes('.jpg') || post?.postURL.includes('.png') || post?.postURL.includes('.jpeg'));
    const isVideo = post?.postURL && (post?.postURL.includes('.mp4') || post?.postURL.includes('.mov') || post?.postURL.includes('.avi'));

    // Get Users Data
    const getUserData = async () => {
        setloading(true)
      try {
        const user = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
        setuser(user.data)
        setloading(false)
      } catch (error) {
        setloading(false)
      }
    }

    const handleLoad = () => {
        setloadingpart(false);
    };

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
          return `${seconds}sec ago`;
        } else if (minutes < 60) {
            if (minutes === 1) {
                return `${minutes}min ago`;
            } else {
                return `${minutes}mins ago`;
            }
        } else if (hours < 24) {
            if (hours === 1) {
                return `${hours}hour ago`;
            } else {
                return `${hours}hours ago`;
            }
        } else if (days < 30) {
            if (days === 1) {
                return `${days}day ago`;
            } else {
                return `${days}days ago`;
            }
        } else if (months < 12) {
            if (months === 1) {
                return `${months}month ago`;
            } else {
                return `${months}months ago`;
            }
        } else {
            if (years === 1) {
                return `${years}year ago`;
            } else {
                return `${years}years ago`;
            }
        }
    };
    
    // For Comment
    const [comment, setcomment] = useState('')

    const handleComment=(event)=>{
        setcomment(event.target.value)
    }

    const postComment = async () => {
        const formData = new FormData()
        try {
            formData.append('postid',post?.postId)
            formData.append('userid',user?.userId)
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

    // For Post Intraction
    const postIntraction = async () =>{
        const formData = new FormData()
        try {
            formData.append('postid',post?.postId)
            formData.append('userid',user?.userId)
            const response = await api.post('/nivak/media/intraction/',formData,{
                headers: {
                    'Content-Type' : 'form-data',
                }
            })
            getPost()
        } catch (error) {
        }
    }

    // Comment reply
    const [commenreply, setcommenreply] = useState(false)
    const [commentid, setcommentid] = useState()
    const [commentuserName, setcommentuserName] = useState()

    const [replycomment, setreplycomment] = useState('')

    const handleReplyComment=(event)=>{
        setreplycomment(event.target.value)
    }

    const commentReplyCall = (commentid, commentUserName) => {
        setcommenreply((prev)=> !prev)
        setcommentid(commentid)
        setcommentuserName(commentUserName)
    }

    const postReplyComment = async () => {
        const formData = new FormData()
        try {
            formData.append('postid',post?.postId)
            formData.append('userid',user?.userId)
            formData.append('commentid',commentid)
            formData.append('commentmsg','@'+commentuserName+' '+replycomment)
            const response = await api.post('/nivak/media/postreplycomment/',formData,{
                headers: {
                    'Content-Type' : 'form-data',
                }
            })
            getPost()
            setreplycomment('')
        } catch (error) {
        }
    }
    // Save Post
    const savePost= async()=>{
        const formData = new FormData()
        formData.append("postid",post?.postId)
        formData.append("userid",user?.userId)
        try {
            await api.post('/nivak/media/savepost/',formData,{
                headers: {
                    'Content-Type' : 'form-data',
                }
            })
            getPost()
            getUserData()
        } catch (error) {
            
        }
    }

    useEffect(() => {
        setloading(true)
        getPost()
        getUserData()

        const socket = new SockJS("http://localhost:8080/ws");
        
        const stompClient = Stomp.over(socket);
    
        stompClient.connect({}, () => {
            console.log("Connected to websocket");
            stompClient.subscribe("/function/intraction", (event) => {
                console.log("Post Liked event received: ", event);
                getPost();
            });
            stompClient.subscribe("/function/postcomment", (event) => {
                console.log("Post Comment event received: ", event);
                getPost()
            });
            stompClient.subscribe("/function/commentintraction", (event) => {
                console.log("Post Comment event received: ", event);
                getPost()
            });
            stompClient.subscribe("/function/postreplycomment", (event) => {
                console.log("Post Comment event received: ", event);
                getPost()
            });
            stompClient.subscribe("/function/replycommentintraction", (event) => {
                console.log("Post Comment event received: ", event);
                getPost()
            });
        });

    }, [])

    
     
  return (
    <div className='overlaypost_'>
        <div className='loading' style={loading?{display:'flex'}:{display:'none'}}>
            <SyncLoader
                color={'#36d7b7'}
                loading={loading}
            />
        </div>
        <button onClick={onClose}><RxCross1/></button>
        <div className='overlaypost'>
            {/* Overlay Post Left */}
            <div className='overlaypost_left'>
                {isImage && (
                    <>
                        <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'auto',height:'100%'} : { display: 'none' }}>
                            <DotLoader
                            size={50}
                            color={'#ffffff'}
                            loading={loadingpart}
                            />
                        </div>
                        <LazyLoadImage
                            key={post?.userId}
                            src={post?.postURL}
                            onLoadedMetadata={handleLoad}
                            effect={'blur'}
                            placeholderSrc={post?.postURL}
                            className='overlaypost_image'
                        />
                    </>
                )}

                {isVideo && (
                    <>
                        <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'auto',height:'100%'} : { display: 'none' }}>
                            <DotLoader
                            size={50}
                            color={'#ffffff'}
                            loading={loadingpart}
                            />
                        </div>
                        <LazyLoadComponent>
                            <video autoPlay loop muted={mute} className='overlaypost_video' onLoadedMetadata={handleLoad} onClick={()=>setmute((prev) => !prev)}>
                                <source src={post?.postURL} type='video/mp4' />
                                Your browser does not support the video tag.
                            </video>
                        </LazyLoadComponent>
                    </>
                )}
            </div>
            {/* Overlay Post Right */}
            <div className='overlaypost_right_'>
                <div className='overlaypost_right'>
                    {/* Overlaypost Right Top */}
                    <div className='overlaypost_right_top_'>
                        <div className='overlaypost_right_top'>
                            <a href={`/account/profile/${postuser?.userName}/`}>
                                <Avatar style={{width:'32px',height:'32px'}}>
                                    <LazyLoadImage
                                        key={post?.userId}
                                        width={32}
                                        height={32}
                                        src={postuser?.profileURL ? postuser?.profileURL : '/profile.png'}
                                        effect={'blur'}
                                        placeholderSrc={postuser?.profileURL ? postuser?.profileURL : '/profile.png'}
                                        className='overlaypost_top_avatar'
                                    />
                                </Avatar>
                            </a>
                            
                            <div className='overlaypost_username'>
                                <p>{postuser?.userName}</p>
                                <p style={{color:'#747474',fontSize:'12px'}}>{postuser?.fullName}</p>
                            </div>
                            <p><BsThreeDots/></p>
                        </div>
                    </div>

                    {/* Overlaypost Right Middle */}
                    <div className='overlaypost_right_middle_'>
                        <div className='overlaypost_right_middle'>
                            <div className='overlaypost_right_middle_description'>
                                <div className='overlaypost_description_left'>
                                    <a href={`/account/profile/${postuser?.userName}/`}>
                                        <Avatar style={{width:'32px',height:'32px'}}>
                                            <LazyLoadImage
                                                key={post?.userId}
                                                width={32}
                                                height={32}
                                                src={postuser?.profileURL ? postuser?.profileURL: '/profile.png'}
                                                effect={'blur'}
                                                placeholderSrc={postuser?.postURL}
                                                className='overlaypost_top_avatar'
                                            />
                                        </Avatar>
                                    </a>
                                </div>
                                <div className='overlaypost_description_right'>
                                    <p>{postuser?.userName}</p>
                                    {post?.postDescription && <p><span>{post?.postDescription}</span></p>}
                                </div>
                            </div>
                            {
                                post?.postComments?.map((comment,index)=>{
                                    return(
                                        <CommentDetails comment={comment} postid={post?.postId} user={user} key={index} getpost={getPost} commentreplyfunction={commentReplyCall}/>
                                    )
                                })
                            }
                            
                        </div>
                    </div>


                    {/* Overlaypost Right Bottom */}
                    <div className='overlaypost_right_bottom_'>

                        <div className='overlaypost_right_bottom_intraction'>
                            <div className='overlaypost_left_intraction'>
                                <p onClick={postIntraction}>{post?.postLikes.includes(user?.userId)  ?<FaHeart style={{color:'red'}}/>:<FaRegHeart/>}</p>
                                <p><FaRegComment/></p>
                                <p><FaPaperPlane/></p>
                            </div>
                            <div className='overlaypost_right_intraction'>
                            <p onClick={savePost}>{user?.savedPost && user?.savedPost?.includes(post?.postId)? <FaBookmark/> : <FaRegBookmark/>}</p>
                            </div>
                        </div>

                        <div className='overlaypost_right_bottom_likes'>
                            {post?.postLikes && <p>{post?.postLikes.length} likes</p>}
                        </div>
                        
                        <div className='overlaypost_right_bottom_time'>
                            <p>{getTimeDifference(post?.postDate, post?.postTime)}</p>
                        </div>

                        <div className='overlaypost_right_bottom_addcomment'>
                            {
                                !commenreply ? (
                                    <>
                                        <input type='text' value={comment} onChange={handleComment} placeholder='Add a comment...'/>{comment !=='' && <button onClick={postComment}>post</button>}
                                    </>
                                ):(
                                    <>
                                        <input type='text' value={replycomment} onChange={handleReplyComment} placeholder={`@${commentuserName}`}/>{replycomment !=='' && <button onClick={postReplyComment}>Reply</button>}
                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default OverlayPost


