import React, { useEffect, useState } from 'react'
import './CommentDetails.css'
import api from "../../../api/axiosConfig";
import { Avatar } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const CommentDetails = ({comment,user,postid,getpost,commentreplyfunction}) => {
    const [commentuser, setcommentuser] = useState()

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
            return `${minutes}min`
        } else if (hours < 24) {
            return `${hours}h`
        } else if (days < 30) {
            return `${days}d`
        } else if (months < 12) {
            return `${months}m`
        } else {
            return `${years}y`
        }
    };

    const commentWithMension = (message) => {
        const regex = /@(\w+)/g;
        return message.replace(regex, (match, username) => {
            // Replace @username with a link to the user's profile or specific action
            return `<a href="/account/profile/${username}/" style='color:#008cff'>@${username}</a>`;
        });
    };

    // For Comment Intraction
    const commentIntraction = async () =>{
        const formData = new FormData()
        try {
            formData.append('postid',postid)
            formData.append('userid',user?.userId)
            formData.append('commentid',comment?.commentId)
            const response = await api.post('/nivak/media/commentintraction/',formData,{
                headers: {
                    'Content-Type' : 'form-data',
                }
            })
            getpost()
        } catch (error) {
        }
    }

    // Get Comment User
    const getCommentUser = async() => {
        try {
            const response = await api.get(`/nivak/media/byuserid/${comment?.commenterUserId}/`)
            setcommentuser(response.data)
        } catch (error) {
        }
    }

    // Comment Reply
    const [viewall, setviewall] = useState(false)

    useEffect(()=>{
        getCommentUser()
    },[])

    return(
        <div className='comment'>
            {/* Comment Left */}
            <div className='comment_left'>
                <a href={`/account/profile/${commentuser?.userName}/`}>
                    <Avatar style={{width:'32px',height:'32px'}}>
                        <LazyLoadImage
                            key={commentuser?.userId}
                            width={32}
                            height={32}
                            src={commentuser?.profileURL}
                            effect={'blur'}
                            placeholderSrc={commentuser?.postURL}
                            className='overlaypost_top_avatar'
                        />
                    </Avatar>
                </a>
            </div>

            {/* Comment Middle */}
            <div className='comment_middle'>
                <div className='comment_middle_username'>
                    <p>{commentuser?.userName} <span>{getTimeDifference(comment?.commentDate,comment?.commentTime)}</span></p>
                </div>
                <div className='comment_middle_data'>
                    <p dangerouslySetInnerHTML={{ __html: commentWithMension(comment?.commentMessage) }}></p>
                </div>
                <div className='comment_middle_intraction'>
                    {comment?.commentLikes && <p>{comment?.commentLikes.length} likes</p>}
                    <p onClick={()=>commentreplyfunction(comment?.commentId,commentuser.userName)}>reply</p>
                </div>
                {   comment?.commentReplies.length>0 &&
                    <>
                        <div className='comment_middle_viewall'>
                            <p onClick={()=>setviewall((prev)=> !prev)}>{viewall?<span>----- Hide all</span>:<span>----- View all {comment?.commentReplies.length} replies</span>}</p>
                        </div>
                        {viewall && 
                            <div>
                                {comment?.commentReplies?.map((commentreply, index)=>{
                                    return(
                                        <ReplyComment key={index} replycomment={commentreply} commentId={comment?.commentId} time={getTimeDifference(commentreply?.replyDate,commentreply?.replyTime)} commentreply={commentreplyfunction} user={user} postid={postid} getpost={getpost}/>
                                    )
                                })
                                
                                }
                            </div>
                        }
                    </>
                }
            </div>

            {/* Comment Right */}
            <div className='comment_right'>
                {!viewall && <p onClick={commentIntraction}>{comment?.commentLikes.includes(user?.userId)  ?<FaHeart style={{color:'red'}}/>:<FaRegHeart/>}</p>}
            </div>
        </div>
    )
}

export default CommentDetails

const ReplyComment=({replycomment,time,commentId,commentreply,user,postid,getpost})=>{
    const [replycommentuser, setreplycommentuser] = useState()

    // Get Reply Comment User
    const ReplyCommentUser = async() => {
        try {
            const response = await api.get(`/nivak/media/byuserid/${replycomment?.replyerUserId}/`)
            setreplycommentuser(response.data)
        } catch (error) {
        }
    }

    // Reply Comment Intraction
    const replycommentIntraction = async () =>{
        const formData = new FormData()
        try {
            formData.append('postid',postid)
            formData.append('userid',user?.userId)
            formData.append('commentid',commentId)
            formData.append('replyid',replycomment?.replyId)
            const response = await api.post('/nivak/media/replycommentintraction/',formData,{
                headers: {
                    'Content-Type' : 'form-data',
                }
            })
            getpost()
        } catch (error) {
        }
    }

    const commentWithMension = (message) => {
        const regex = /@(\w+)/g;
        return message.replace(regex, (match, username) => {
            // Replace @username with a link to the user's profile or specific action
            return `<a href="/account/profile/${username}/" style='color:#008cff'>@${username}</a>`;
        });
    };


    useEffect(()=>{
        ReplyCommentUser()
    },[])

    return(
        <div className='comment'>
            {/* Comment Left */}
            <div className='comment_left'>
                <a href={`/account/profile/${replycommentuser?.userName}/`}>
                    <Avatar style={{width:'32px',height:'32px'}}>
                        <LazyLoadImage
                            key={replycommentuser?.userId}
                            width={32}
                            height={32}
                            src={replycommentuser?.profileURL ? replycommentuser?.profileURL : '/profile.png'}
                            effect={'blur'}
                            placeholderSrc={replycommentuser?.profileURL ? replycommentuser?.profileURL : '/profile.png'}
                            className='overlaypost_top_avatar'
                        />
                    </Avatar>
                </a>
            </div>

            {/* Comment Middle */}
            <div className='comment_middle'>
                <div className='comment_middle_username'>
                    <p>{replycommentuser?.userName} <span>{time}</span></p>
                </div>
                <div className='comment_middle_data'>
                    <p dangerouslySetInnerHTML={{ __html: commentWithMension(replycomment?.replyMessage) }}></p>
                </div>
                <div className='comment_middle_intraction'>
                    {replycomment?.replyLikes && <p>{replycomment?.replyLikes.length} likes</p>}
                    <p onClick={()=>commentreply(commentId,replycommentuser.userName)}>reply</p>
                </div>
            </div>

            {/* Comment Right */}
            <div className='comment_right'>
                <p onClick={replycommentIntraction}>{replycomment?.replyLikes.includes(user?.userId)  ?<FaHeart style={{color:'red'}}/>:<FaRegHeart/>}</p>
            </div>
        </div>
    )
}
