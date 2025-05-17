import React, { useEffect, useRef, useState } from 'react'
import './Notification.css'
import api from '../../api/axiosConfig'
import OverlayPost from '../OverlayPost/OverlayPost'
import Cookies from 'js-cookie'
import { RxCross1 } from 'react-icons/rx'
import SockJS from 'sockjs-client'
import { Stomp } from 'stompjs/lib/stomp'
import { Avatar } from '@mui/material'
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'
import ApiFunctions from '../../ApiFunctions'
import Functions from '../../Functions'

const Notification = ({onClose}) => {
    const [currentUser, setcurrentUser] = useState()

    const {toGetUserData} = ApiFunctions()

    const getCurrentUser = async () =>{
        setcurrentUser((await toGetUserData({id:Cookies.get("_id")})).data.data);
    }

    useEffect(()=>{
        getCurrentUser()
        const socket = new SockJS(`${api.defaults.baseURL}/ws`);
        
        const stompClient = Stomp.over(socket);
    
        stompClient.connect({}, () => {
            stompClient.subscribe("/function/notification", (event) => {
                getCurrentUser();
            });
        });
    },[])

  return (
    <div className='notification_'>
        <button onClick={onClose}><RxCross1/></button>
        <div className='notification'>
            <div className='notification_container'>
                <div className='notification_top'>
                    <p>Notifications</p>
                </div>
                <div className="notification_bottom">
                    {currentUser?.notifications && currentUser?.notifications?.map((notification,index)=>{
                        
                        return(
                            <div key={index}>
                                <NotificationData notification={notification}/>
                            </div>
                        )
                        
                    })}
                    {currentUser?.notifications?.length === 0 && <span className='nomessage'>No Notifications</span>}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Notification


const NotificationData=({notification})=>{
    
    const [data, setdata] = useState()
    const [post, setpost] = useState()
    const [isImage, setisImage] = useState(false);
    const [isSeen, setisSeen] = useState(notification.seen)

    const { toGetPost, toGetUserData, toSeenNotification } = ApiFunctions();
    const { toCheckIsImage, toGetTimeDifference } = Functions();
    
    const getPostById = async () =>{
        
        const response = (await toGetPost({postId: notification?.postId})).data.data
        
        setpost(response);
        setisImage(toCheckIsImage({url: response?.postURL}))
        
    }
    const getUserData = async () =>{
        setdata((await toGetUserData({id: notification?.userId})).data.data)
    }

    // to Open Each post
    const [selectedPostId, setSelectedPostId] = useState(null); // To store the selected postId
    const [overlaypost, setoverlaypost] = useState(false);

    const handleOverlayPost = (postId) => {
        setSelectedPostId(postId);
        setoverlaypost(true);
    }

    const closeOverlayPost=()=>{
        setoverlaypost(false)
    }

    // Notification Seen
    const notificationseen = async(notificationId) =>{
        if(!notification.seen) {
            await toSeenNotification({notificationId: notificationId, id: Cookies.get("_id")})
        }
    }


    useEffect(() => {
        const fetchData = async () => {
            if (notification?.postId === null) {
                await getUserData();
            } else {
                await getPostById();
            }
        };
        fetchData();
        
    }, []);


    const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !notification.seen) {
          notificationseen(notification?.id);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

    

    return(
        <div className='notification_data' ref={elementRef}>
            {overlaypost && selectedPostId && (
                <OverlayPost postid={selectedPostId} onClose={closeOverlayPost} className='post_overlaypost' />
            )}
            <div className='notification_data_left'>
                {data && 
                    <a href={`/account/profile/${data?.id}/`} style={{cursor:"pointer"}}>
                        <Avatar style={{width:"35px", height:"35px"}}>
                            <img src={data?.profileURL? data?.profileURL : '/prfoile.png'} style={{width:"35px", height:"35px"}}/>
                        </Avatar>
                    </a>
                }
                {post && 
                    <div>
                        {isImage ? 
                            <LazyLoadImage
                                key={post?.userId}
                                src={post?.postURL}
                                effect={'blur'}
                                placeholderSrc={post?.postURL}
                                style={{width:"30px", height:"35px",borderRadius:"3px",cursor:"pointer"}}
                                onClick={()=>handleOverlayPost(post?.id)}
                            />
                        :
                            <LazyLoadComponent>
                                <video style={{width:"30px", height:"35px",borderRadius:"3px",cursor:"pointer"}} onClick={()=>handleOverlayPost(post?.postId)}>
                                    <source src={post?.postURL} type='video/mp4' />
                                    Your browser does not support the video tag.
                                </video>
                            </LazyLoadComponent>
                        }
                    </div>
                }
                {!isSeen && <p className='unseen'></p>}
            </div>
            <div className='notification_data_right'>
                <p>{notification?.notificationMessage}. <span style={{color:"#747474", fontSize:"10px"}}>{toGetTimeDifference({targetDate: notification?.notificationDate, targetTime: notification?.notificationTime, fullFormat: false})}</span></p>
            </div>
        </div>
    )
}
