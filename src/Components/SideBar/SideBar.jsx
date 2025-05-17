import React, { useEffect, useRef, useState } from 'react'
import './SideBar.css'
import api from "../../api/axiosConfig";
import { VscArrowLeft, VscBell, VscClose, VscCompass, VscHome, VscPlayCircle, VscSearch, VscSend, VscThreeBars } from "react-icons/vsc";
import { FiPlusCircle } from "react-icons/fi";
import { GrGallery } from "react-icons/gr";
import { BsAspectRatio } from "react-icons/bs";
import { LuImage, LuRectangleHorizontal, LuRectangleVertical, LuSquare } from "react-icons/lu";
import Cookies from 'js-cookie';
import { Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostView from './PostView/PostView';
import {BarLoader, ScaleLoader, SyncLoader} from "react-spinners";
import Friends from '../Friends/Friends';
import Notification from '../Notification/Notification';
import SockJS from 'sockjs-client';
import { Stomp } from 'stompjs/lib/stomp';
import { useLoader } from '../../Others/LoaderContext';
import Functions from '../../Functions';


const SideBar = () => {
  const { startLoader, stopLoader } = useLoader()
  const [user, setuser] = useState()
  const navigate = useNavigate()
  const pathname = window.location.pathname; // Only path
  const isActive = {
    isHome : false,
    isSearch : false,
    isExplore : false,
    isReels : false,
    isMessage : false,
    isNotification : false,
    isPost : false,
    isProfile : false,
  }

  if(pathname === '/account/'){
    isActive.isHome = true;
  }
  else {
    isActive.isExplore = pathname.includes('/explore/');
    isActive.isReels = pathname.includes('/reels/');
    isActive.isMessage = pathname.includes('/message/');
    isActive.isProfile = pathname.includes('/profile/');
  }

  // Get Login User data
  const getUser=async()=>{
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000,
    };

    try {
      const response = await api.post("/nivak/user/getuserdata/", null, {
            params: {
                id: Cookies.get("_id")
            },
            ...config
        })
      setuser(response.data.data)
    } catch (error) {
    }
  }

  // To Open and Close NewPost overlay
  const toOpenNewPost = () => {
    
    setisOpenNewPost(true)
  }
  const toCloseNewPost = () => {
    setisOpenNewPost(false)
  }

  // Post Create 
  const [isOpenNewPost, setisOpenNewPost] = useState(false)
  const [postPreview, setpostPreview] = useState(null)
  const [post, setpost] = useState(null)
  const [isPost, setisPost] = useState(false)
  const [next, setnext] = useState(false)
  

  const readPost = (post) => {
    const reader = new FileReader();
  
    reader.onload = (event) => {
      setpostPreview(event.target.result);
      setisPost(true);
    };
  
    if (post) {
      if (post.type.startsWith('image/') || post.type.startsWith('video/')) {
        reader.readAsDataURL(post);
      }
    }
  };

  const postDragEnter = (event) =>{
    event.preventDefault();
    event.stopPropagation();
  }
  const postDragOver = (event) =>{
    event.preventDefault();
    event.stopPropagation();
  }

  const postDrop = (event) =>{
    event.preventDefault();
    const files = event.dataTransfer.files;
    const maxSizeInBytes = 25 * 1024 * 1024;

    if (files && files.length > 0) {
      if (files[0].size > maxSizeInBytes) {
        alert('File size is too large (max: 25MB). Please choose a smaller file.');
      }
      else{
        setpost(files[0]);
        readPost(files[0]);
      }
      
    }
  }
  const postChange = (event) => {
    event.preventDefault()
    const files = event.target.files
    const maxSizeInBytes = 25 * 1024 * 1024;

    if (files.length>0) {
      if (files[0].size > maxSizeInBytes) {
        alert('File size is too large (max: 25MB). Please choose a smaller file.');
      }
      else{
        setpost(files[0])
        readPost(files[0])
      }
      
    }
  }


  // Post Crop
  const [openCrop, setopenCrop] = useState(false)
  const [crop,setcrop] = useState({aspect:NaN})
  

  const cropPost = (selectedCrop) => {
    if (selectedCrop === '1:1') {
      setcrop({ aspect: 1 });
    } else if (selectedCrop === '4:5') {
      setcrop({ aspect: 4 / 5 });
    } else if (selectedCrop === '16:9') {
      setcrop({ aspect: 16 / 9 });
    } else if (selectedCrop === 'original') {
      setcrop({ aspect: NaN });
    }
  };

  const handleOnCrop = (crop) => {
    setcrop(crop)
  }
 


  // Post Share
  const [description, setdescription] = useState("")

  const updateDescription = (event) =>{
      setdescription(event.target.value)
  }

  const sharePost= async ()=>{
    
    startLoader("Uploading Post...")
    const formData = new FormData();
    formData.append('id',Cookies.get("_id"))
    formData.append('post',post)
    formData.append('description', description)

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      },
      timeout: 50000,
    };

    try {
      const response = await api.post('/nivak/post/newpost/',formData,config)
      console.log(response);
      
      stopLoader(response.data.status, response.data.message, response.data.message)
      toCloseButton()
    } catch (error) {
      console.log(error);
      
      stopLoader(false)
    }
  }
  



  // Action functions
  const toNextButton = () =>{
    setnext(true)
    setisPost(false)
  }
  const toBackButton=()=>{
    setpost(null)
    setpostPreview(null)
    setisPost(false)
    setnext(false)
    setdescription('')
  }
  const toCloseButton = () =>{
    toCloseNewPost()
    setpost(null)
    setpostPreview(null)
    setisPost(false)
    setnext(false)
    setdescription('')
  }

  
  // Friend Status
  const [frndstatus, setfrndstatus] = useState('')
  const [friendstatus, setfriendstatus] = useState(false);

  const handlestatus = (status) => {
    setfrndstatus(status)
    setfriendstatus(true);
  }

  const handleCloseStatus = () => {
    setfriendstatus(false)
    getUser()
  }

  // ForNotification
  const [notification, setnotification] = useState(false)
  const openNotification=()=>{
    setnotification(true)
  }
  const closeNotification=()=>{
    setnotification(false)
  }

  // notification Count
  let notification_count = 0

  if (user) {
    user?.notifications?.map((notification)=>{
      if(notification?.seen === false){
        notification_count++
      }
    })
  }

  // UseEffect
  useEffect(() => {
    getUser()
    if(typeof Cookies.get('user') === 'undefined'){
      //navigate('/')
    }

    const socket = new SockJS(`${api.defaults.baseURL}/ws`);
        
    const stompClient = Stomp.over(socket);
    stompClient.debug = null

    stompClient.connect({}, () => {
        stompClient.subscribe("/function/notification", (event) => {
          if (event.headers.destination === "/function/notification") {
              getUser()
          }
        });
    });

  }, [])
  
  return (
    <>
      {friendstatus && (
          <Friends status={frndstatus} onClose={handleCloseStatus} />
      )}
      <div className='sidebar'>
          {/* Side bar Logo */}
          <div className='sidebar_logo'>
              <img src='/logo192.png'/>
          </div>
          {/* Side bar Content */}
          <div className='sidebar_content'>
              {/* Home */}
              <div className='sidebar_icons_'>
                  <a href='/account/' className={isActive.isHome ? 'icon_active' : ''}>
                    <VscHome className='sidebar_icon'/>
                    <span>Home</span>
                  </a>
              </div>
              {/* Search */}
              <div className='sidebar_icons_'>
                  <a onClick={()=>handlestatus('search')} className={isActive.isSearch ? 'icon_active' : ''}>
                    <VscSearch className='sidebar_icon'/>
                    <span>Search</span>
                  </a>
              </div>
              {/* Explore */}
              <div className='sidebar_icons_'>
                  <a href='/account/explore/' className={isActive.isExplore ? 'icon_active' : ''}>
                    <VscCompass className='sidebar_icon'/>
                    <span>Explore</span>
                  </a>
              </div>
              {/* Reels */}
              <div className='sidebar_icons_'>
                  <a href='/account/reels/' className={isActive.isReels ? 'icon_active' : ''}>
                    <VscPlayCircle className='sidebar_icon'/>
                    <span>Reels</span>
                  </a>
              </div>
              {/* Message */}
              <div className='sidebar_icons_'>
                  <a className={isActive.isMessage ? 'icon_active' : ''}>
                    <VscSend className='sidebar_icon'/>
                    <span>Message</span>
                  </a>
              </div>
              {/* Notification */}
              <div className='sidebar_icons_'>
                  <a onClick={openNotification} className={isActive.isNotification ? 'icon_active' : ''}>
                    <VscBell className='sidebar_icon'/>{notification_count !== 0 ? <sup>{notification_count}</sup>: <></>}
                    <span>Notification</span>
                  </a>
              </div>
              {/* Post */}
              <div className='sidebar_icons_'>
                  <a onClick={toOpenNewPost} className={isActive.isPost ? 'icon_active' : ''}>
                    <FiPlusCircle className='sidebar_icon'/>
                    <span>Post</span>
                  </a>
              </div>
              {/* Profile */}
              <div className='sidebar_icons_'>
                  <a href={`/account/profile/${Cookies.get("_id")}/`} className={isActive.isProfile ? 'icon_active' : ''}>
                    <Avatar className='sidebar_icon' style={{width:"27px",height:"27px"}}>
                    {
                      user?.profileURL ? (
                        <img src={user?.profileURL} className='sidebar_icon'/>
                      ):(
                        <img src='/profile.png' className='sidebar_icon'/>
                      )
                    }
                    </Avatar>
                    <span>Profile</span>
                  </a>
              </div>
              {/* More */}
              <div className='sidebar_icons_'>
                  <a>
                    <VscThreeBars className='sidebar_icon'/>
                    <span>More</span>
                  </a>
              </div>
          </div>


          {/* Sidebar icon process */}
          <div className='newpost_overlay' id='newpost_overlay' style={isOpenNewPost?{display:'flex'}:{display:'none'}}>
            <button onClick={toCloseButton}><VscClose/></button>
            {
              isOpenNewPost && !next ?(
                <>
                  {/* New Post Create */}
                  <div className='newpost_create newpost_background'>
                    {/* New Post Create Top*/}
                    <div className='newpost_create_top' style={isPost?{justifyContent:'space-between'}:{justifyContent:'center'}}>
                      {isPost && <h2 onClick={toBackButton}><VscArrowLeft/></h2>}
                      {isPost ? (<p>Crop</p>):(<p>Create New Post</p>)}
                      {isPost && <button onClick={toNextButton}>Next</button>}
                    </div>
                    {/* New Post Create Bottom*/}
                    <div className='newpost_create_bottom' id='newpost_create_bottom' onDrop={postDrop} onDragEnter={postDragEnter} onDragOver={postDragOver} style={isPost?{alignItems:'normal', justifyContent:'normal'}:{alignItems:'center', justifyContent:'center'}}>
                      {
                        isPost ? (
                          <>
                          {
                            postPreview && (
                              <>
                                {next?<></>:<PostView postPreview={postPreview} rightborder={true}/>}
                                {/*{postPreview.startsWith('data:image') &&
                                  <div className='postcrop_options'>
                                      <div className='postcrop_options_select' style={!openCrop?{background:'transparent'}:{background:'#000000a9'}}>
                                        {openCrop &&
                                          <>
                                            <p onClick={() => cropPost('original')}>Original <LuImage className='select_icon'/></p>
                                            <p onClick={() => cropPost('1:1')}>1:1 <LuSquare className='select_icon'/></p>
                                            <p onClick={() => cropPost('4:5')}>4:5 <LuRectangleHorizontal className='select_icon'/></p>
                                            <p onClick={() => cropPost('16:9')}>16:9 <LuRectangleVertical className='select_icon'/></p> 
                                          </> 
                                        }
                                      </div>
                                    <p onClick={()=> setopenCrop(pre=>!pre)}><BsAspectRatio/></p>
                                  </div>
                                }
                                */}
                              </>
                            )
                          }
                          </>
                        ):(
                          <>
                            <input type='file' accept='image/*, video/*' onChange={postChange} style={{display:'none'}} />
                            <h1><GrGallery/></h1>
                            <h5>Drag photos and Videos here</h5>
                            <label htmlFor='fileInput'>
                              <button onClick={() => {
                                const post = document.querySelector('input[type=file]')
                                if(post){
                                  post.click()
                                  post.addEventListener('change',postChange)
                                }
                              }}>
                                Select from Device
                              </button>
                            </label>
                          </>
                        )
                      }
                    </div>
                  </div>
                </>
              ):(
                <>
                  {/* New Post Share */}
                  <div className='newpost_share newpost_background'>
                    {/* New Post Share Top*/}
                    <div className='newpost_share_top'>
                      <h2 onClick={toBackButton}><VscArrowLeft/></h2>
                      <p>Share Post</p>
                      <button onClick={sharePost}>Share</button>
                    </div>
                    {/* New Post Share Bottom*/}
                    <div className='newpost_share_bottom' id='newpost_share_bottom' onDrop={postDrop} onDragEnter={postDragEnter} onDragOver={postDragOver}>
                      <div className='newpost_share_bottom_left'>
                        {
                          postPreview && next?<PostView postPreview={postPreview}/>:<></>
                        }
                      </div>
                      <div className='newpost_share_bottom_right'>
                        <div className='newpost_share_bottom_right_top'>
                          <Avatar className='description_avatar'>
                            <img src={user?.profileURL ? user?.profileURL : '/profile.png'}/>
                          </Avatar>
                          <p>{user?.userName}</p>
                        </div>
                        <textarea placeholder='Write a Caption...' value={description} onChange={updateDescription} rows={30} cols={50}/>
                      </div>
                    </div>
                  </div>
                </>
              )
            }
          </div>

          {/* Notification Process */}
          {notification && <Notification onClose={closeNotification}/>}
      </div>
    </>
  )
}

export default SideBar
