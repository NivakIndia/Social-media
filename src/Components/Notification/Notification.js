import React, { useEffect, useState } from 'react'
import './Notification.css'
import api from '../../api/axiosConfig'
import OverlayPost from '../OverlayPost/OverlayPost'
import Cookies from 'js-cookie'
import { RxCross1 } from 'react-icons/rx'
import SockJS from 'sockjs-client'
import { Stomp } from 'stompjs/lib/stomp'
import { Avatar } from '@mui/material'
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'

const Notification = ({onClose}) => {
    const [currentUser, setcurrentUser] = useState()

    const getCurrentUser = async () =>{
        try {
            const response = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
            setcurrentUser(response.data);
        } catch (error) {
            
        }
    }

    useEffect(()=>{
        getCurrentUser()
        const socket = new SockJS("http://localhost:8080/ws");
        
        const stompClient = Stomp.over(socket);
    
        stompClient.connect({}, () => {
            console.log("Connected to websocket");
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
                    <p>Unseen Notifications</p>
                    {currentUser?.notifications && currentUser?.notifications?.map((notification,index)=>{
                        if(!notification?.seen){
                            return(
                                <div key={index}>
                                    <NotificationData notification={notification}/>
                                </div>
                            )
                        }
                    })}
                    {currentUser?.notifications?.length === 0 && <span className='nomessage'>No Notifications</span>}
                </div>
                <div className='notification_bottom'>
                    <p>Seen Notifications</p>
                    {currentUser?.notifications && currentUser?.notifications?.map((notification,index)=>{
                        if(notification?.seen){
                            return(
                                <div key={index}>
                                    <NotificationData notification={notification}/>
                                </div>
                            )
                        }
                    })}
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
    
    const getPostById = async () =>{
        try {
            const response = await api.get(`/nivak/media/postbypostid/${notification?.postid}/`)
            setpost(response.data);
            const isImages = response.data?.postURL && (response.data.postURL?.includes('.jpg') || response.data?.postURL.includes('.png') || response.data?.postURL.includes('.jpeg'));
            if (isImages) {
                setisImage(true)
            }
            else{
                setisImage(false)
            }
        } catch (error) {
            
        }
    }
    const getUserData = async () =>{
        try {
            const response = await api.get(`/nivak/media/byuserid/${notification?.userId}/`)
            setdata(response.data);
        } catch (error) {
            
        }
    }

    // to Open Each post
    const [selectedPostId, setSelectedPostId] = useState(null); // To store the selected postId
    const [overlaypost, setoverlaypost] = useState(false);

    const handleOverlayPost = (postId) => {
        setSelectedPostId(postId); // Set the selected postId
        setoverlaypost(true); // Open the OverlayPost component
    }

    const closeOverlayPost=()=>{
        setoverlaypost(false)
    }

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

    // Notification Seen
    const notificationseen = async(notificationId) =>{
        try {
            const formData = new FormData()
            formData.append("userid",Cookies.get('user'))
            formData.append("notificationid",notificationId)
            await api.post("/nivak/media/notificationseen/", formData,{
                headers:{
                    "Content-Type":"form-data"
                }
            })
        } catch (error) {
            
        }
    }


    useEffect(() => {
        const fetchData = async () => {
            if (notification?.postid === 0) {
                await getUserData();
            } else {
                await getPostById();
            }
        };
        fetchData();
    }, [notification?.postid]);

    return(
        <div className='notification_data'>
            {overlaypost && selectedPostId && (
                <OverlayPost postid={selectedPostId} onClose={closeOverlayPost} className='post_overlaypost' />
            )}
            <div className='notification_data_left'>
                {data && 
                    <a href={`/account/profile/${data?.userName}/`} style={{cursor:"pointer"}}>
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
                                onClick={()=>handleOverlayPost(post?.postId)}
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
            </div>
            <div className='notification_data_right'>
                <p onClick={()=>notificationseen(notification?.notificationId)}>{notification?.notificationMessage}. <span style={{color:"#747474", fontSize:"10px"}}>{getTimeDifference(notification?.notificationDate, notification?.notificationTime)}</span></p>
            </div>
        </div>
    )
}
