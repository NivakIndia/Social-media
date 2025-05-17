import React, { useEffect, useState } from 'react'
import './OverlayPost.css'
import api from '../../api/axiosConfig'
import Cookies from 'js-cookie'
import { RxCross1 } from "react-icons/rx";
import { BsThreeDots } from 'react-icons/bs';
import { FaBookmark, FaHeart, FaPaperPlane, FaRegBookmark, FaRegComment, FaRegHeart } from 'react-icons/fa';
import CommentDetails from './Comment/CommentDetails';
import SockJS from 'sockjs-client'
import { Stomp } from 'stompjs/lib/stomp'
import ImageLoading from '../../Others/ImageLoading';
import ApiFunctions from '../../ApiFunctions';
import Functions from '../../Functions';
import MentionTextArea from '../../Others/MentionTextArea';

const OverlayPost = ({ onClose, postid }) => {

    const { toGetPost, toGetUserData } = ApiFunctions()
    const { toCheckIsImage, toCheckIsVideo, toGetTimeDifference } = Functions()

    const [postuser, setpostuser] = useState()

    const [post, setpost] = useState()
    const [mute, setmute] = useState(false)
    const [isImage, setisImage] = useState(false)
    const [isVideo, setisVideo] = useState(false)

    const [loading, setloading] = useState()

    /* Get post by postid */
    const getPost = async () => {
        setloading(true)
        try {
            const post_ = await (await toGetPost({ postId: postid })).data.data
            setpost(post_)

            getPostUser(post_?.userId)
            setisImage(toCheckIsImage({ url: post_?.postURL }))
            setisVideo(toCheckIsVideo({ url: post_?.postURL }))
            setloading(false)
        } catch (error) {

        }
    }

    /* Get Post User */
    const getPostUser = async (postUserId) => {
        setloading(true)
        setpostuser((await toGetUserData({ id: postUserId })).data.data)
        setloading(false)
    }

    /* get Time from present */
    const getTimeDifference = (targetDate, targetTime) => {
        return toGetTimeDifference({ targetDate: targetDate, targetTime: targetTime, fullFormat: true })
    };

    useEffect(() => {
        getPost()
    }, [])




    return (
        <div className='overlaypost_'>
            <button onClick={onClose}><RxCross1 /></button>
            <div className='overlaypost'>
                {/* Overlay Post Left */}
                <div className='overlaypost_left'>
                    {loading ? <ImageLoading isBackground={true} />
                        :
                        <>
                            {isImage && (
                                <div className='overlaypost_left_'>
                                    <img
                                        key={post?.userId}
                                        src={post?.postURL}
                                        effect={'blur'}
                                        className='overlaypost_image'
                                    />
                                </div>
                            )}

                            {isVideo && (
                                <video autoPlay loop muted={mute} className='overlaypost_video' onClick={() => setmute((prev) => !prev)}>
                                    <source src={post?.postURL} type='video/mp4' />
                                    Your browser does not support the video tag.
                                </video>
                            )}</>
                    }
                </div>

                {/* Overlay Post Right */}
                <div className='overlaypost_right_'>
                    <div className='overlaypost_right'>
                        {/* Overlaypost Right Top */}
                        <div className='overlaypost_right_top_'>
                            <div className='overlaypost_right_top'>
                                <a href={`/account/profile/${post?.userId}/`}>
                                    <div className='avatar-size'>
                                        {loading ? <ImageLoading /> :
                                            <img
                                                key={post?.id}
                                                src={postuser?.profileURL ? postuser?.profileURL : '/profile.png'}
                                                effect={'blur'}
                                                className='overlaypost_top_avatar'
                                            />}
                                    </div>
                                </a>

                                <div className='overlaypost_username'>
                                    <p>{postuser?.userName}</p>
                                    <p className='overlaypost_username-fullname'>{postuser?.fullName}</p>
                                </div>
                                <p><BsThreeDots /></p>
                            </div>
                        </div>
                        <PostLowerPart postid={postid} postuser={postuser} getTimeDifference={getTimeDifference} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverlayPost;


const PostLowerPart = ({ postid, postuser, getTimeDifference }) => {

    const { toGetPost, toGetUserData, forPostComment, forPostIntraction, forReplyComment, toSavePost } = ApiFunctions()
    const [placeHolder, setplaceHolder] = useState(true)
    const [lowerPart, setlowerPart] = useState()
    const [user, setuser] = useState()
    const [comment, setcomment] = useState('')

    /* Get post by postid */
    const getPostLower = async ({ postID }) => {
        setlowerPart((await toGetPost({ postId: postID ? postID : postid })).data.data)
    }


    /* Get Users Data */
    const getUserData = async () => {
        setuser((await toGetUserData({ id: Cookies.get("_id") })).data.data)
    }

    const handleComment = (event) => {
        setcomment(event.target.value)
    }

    const postComment = async () => {
        await forPostComment({ postId: postid, userId: user.id, comment: comment })
        setcomment("")
    }

    // For Post Intraction
    const postIntraction = async () => {
        await forPostIntraction({ postId: lowerPart.id, userId: user.id })
    }

    // Comment reply
    const [commenreply, setcommenreply] = useState(false)
    const [commentid, setcommentid] = useState()
    const [commentuserName, setcommentuserName] = useState()

    const [replycomment, setreplycomment] = useState('')

    const handleReplyComment = (event) => {
        setreplycomment(event)
    }

    const commentReplyCall = (commentid, commentUserName) => {
        setcommenreply((prev) => !prev)
        setcommentid(commentid)
        setcommentuserName(commentUserName)
    }

    const postReplyComment = async () => {
        await forReplyComment({ postId: lowerPart.id, userId: user.id, commentId: commentid, commentMSG: '@' + commentuserName + ' ' + replycomment })
        setreplycomment('')
    }
    // Save Post
    const savePost = async () => {
        await toSavePost({ postId: lowerPart.id, userId: user.id })
        getUserData()
    }



    useEffect(() => {
        getPostLower(postid)
        getUserData()

        const socket = new SockJS(`${api.defaults.baseURL}/ws`);

        const stompClient = Stomp.over(socket);

        stompClient.debug = null

        stompClient.connect({}, () => {
            stompClient.subscribe("/function/intraction", (event) => {
                if (event.headers.destination === "/function/intraction") {
                    getPostLower(event.body);
                }
            });
            stompClient.subscribe("/function/postcomment", (event) => {
                if (event.headers.destination === "/function/postcomment") {
                    getPostLower(event.body);
                }
            });
            stompClient.subscribe("/function/commentintraction", (event) => {
                if (event.headers.destination === "/function/commentintraction") {
                    getPostLower(event.body);
                }
            });
            stompClient.subscribe("/function/postreplycomment", (event) => {
                if (event.headers.destination === "/function/postreplycomment") {
                    getPostLower(event.body);
                }
            });
            stompClient.subscribe("/function/replycommentintraction", (event) => {
                if (event.headers.destination === "/function/replycommentintraction") {
                    getPostLower(event.body);
                }
            });
        });


    }, [])

    return (
        <>
            {/* Overlaypost Right Middle */}
            <div className='overlaypost_right_middle_'>
                <div className='overlaypost_right_middle'>
                    <div className='overlaypost_right_middle_description'>
                        <div className='overlaypost_description_left'>
                            <a href={`/account/profile/${lowerPart?.userId}/`}>
                                <div className='avatar-size'>
                                    <img
                                        key={lowerPart?.id}
                                        src={postuser?.profileURL ? postuser?.profileURL : '/profile.png'}
                                        effect={'blur'}
                                        className='overlaypost_top_avatar'
                                    />
                                </div>
                            </a>
                        </div>
                        <div className='overlaypost_description_right'>
                            <p>{postuser?.userName}</p>
                            {lowerPart?.postDescription && <p><span>{lowerPart?.postDescription}</span></p>}
                        </div>
                    </div>
                    {
                        lowerPart?.postComments?.map((comment, index) => {
                            return (
                                <CommentDetails comment={comment} postid={lowerPart?.id} user={user} key={index} getpost={getPostLower} commentreplyfunction={commentReplyCall} />
                            )
                        })
                    }

                </div>
            </div>


            {/* Overlaypost Right Bottom */}
            <div className='overlaypost_right_bottom_'>

                <div className='overlaypost_right_bottom_intraction'>
                    <div className='overlaypost_left_intraction'>
                        <p onClick={postIntraction}>{lowerPart?.postLikes.includes(user?.id) ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />}</p>
                        <p><FaPaperPlane /></p>
                    </div>
                    <div className='overlaypost_right_intraction'>
                        <p onClick={savePost}>{user?.savedPost && user?.savedPost?.includes(lowerPart?.id) ? <FaBookmark /> : <FaRegBookmark />}</p>
                    </div>
                </div>

                <div className='overlaypost_right_bottom_likes'>
                    {lowerPart?.postLikes && <p>{lowerPart?.postLikes.length} likes</p>}
                </div>

                <div className='overlaypost_right_bottom_time'>
                    <p>{getTimeDifference(lowerPart?.postDate, lowerPart?.postTime)}</p>
                </div>

                <div className='overlaypost_right_bottom_addcomment'>
                    <><MentionTextArea className="commentBox" message={comment} placeholder={"Type Here..."} setMessage={setcomment} isEditable={true} />{comment !== '' && <button onClick={postComment}>post</button>}</>
                </div>
            </div>
        </>
    )
}

















/* {showSuggestions && (
                <ul className={`suggestions-list ${popupPosition}`}>
                    {filteredSuggestions.map((suggestion, index) => (
                        <li 
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion.userName)}
                        >
                            <div className='mention_top'>
                                <div className='mention_top_avatar'>
                                    <a href={`/account/profile/${suggestion?.id}/`}>
                                        <img src={suggestion?.profileURL || '/profile.png'} alt="profile" />
                                    </a>
                                </div>
                                <div className='mention_top_content'>
                                    <p>{suggestion?.userName}</p>
                                    <span>{suggestion?.fullName}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}*/