import React, { useEffect, useState } from 'react'
import './CommentDetails.css'
import { Avatar } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Functions from '../../../Functions';
import ApiFunctions from '../../../ApiFunctions';
import MentionTextArea from '../../../Others/MentionTextArea';

const CommentDetails = ({comment,user,postid,getpost,commentreplyfunction}) => {

    const { forCommentInstraction, toGetUserData } = ApiFunctions()
    const { toGetTimeDifference } = Functions()
    const [commentuser, setcommentuser] = useState()

    /* get Time from present */
    const getTimeDifference = (targetDate, targetTime) => {
        return toGetTimeDifference({targetDate: targetDate, targetTime: targetTime, fullFormat: false})
    };


    /* For Comment Intraction */
    const commentIntraction = async () =>{
        await forCommentInstraction({postId: postid, userId: user.id, commentId: comment.commentId})
        getpost(postid)
    }

    // Get Comment User
    const getCommentUser = async() => {
        setcommentuser((await toGetUserData({id: comment.commenterUserId})).data.data)
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
                    <MentionTextArea className="" message={comment?.commentMessage} setMessage={null} placeholder='Add a comment...' isEditable={false}/>
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
                {!viewall && <p onClick={commentIntraction}>{comment?.commentLikes.includes(user?.id)  ?<FaHeart style={{color:'red'}}/>:<FaRegHeart/>}</p>}
            </div>
        </div>
    )
}

export default CommentDetails

const ReplyComment=({replycomment,time,commentId,commentreply,user,postid,getpost})=>{

    const { toGetUserData, forReplyCommentIntraction } = ApiFunctions()
    const [replycommentuser, setreplycommentuser] = useState()

    /* Get Reply Comment User */
    const ReplyCommentUser = async() => {
        setreplycommentuser((await toGetUserData({id: replycomment.replyerUserId})).data.data)
    }

    /* Reply Comment Intraction */
    const replycommentIntraction = async () =>{
        await forReplyCommentIntraction({postId: postid, userId: user.id, commentId: commentId, replyId: replycomment.replyId})
        getpost(postid)
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
                <p onClick={replycommentIntraction}>{replycomment?.replyLikes.includes(user?.id)  ?<FaHeart style={{color:'red'}}/>:<FaRegHeart/>}</p>
            </div>
        </div>
    )
}
