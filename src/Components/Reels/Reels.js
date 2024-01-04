import React, { useEffect, useRef, useState } from 'react'
import './Reels.css'
import SideBar from '../SideBar/SideBar'
import api from '../../api/axiosConfig'
import OverlayPost from '../OverlayPost/OverlayPost'
import { DotLoader, SyncLoader } from 'react-spinners'
import Cookies from 'js-cookie'
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'
import ReactPlayer from 'react-player'
import { useInView } from 'react-intersection-observer'
import { FaBookmark, FaHeart, FaPaperPlane, FaPause, FaPlay, FaRegBookmark, FaRegComment, FaRegHeart, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import { BsThreeDots } from 'react-icons/bs'
import { Avatar } from '@mui/material'

const Reels = () => {

  const [allpost, setallpost] = useState()
  const [user, setuser] = useState()
  const [loading, setloading] = useState(false)

  const shufflePost =(array)=>{
      const shuffledPost = [...array]
      for (let i = shuffledPost?.length-1; i > 0; i--) {
          const j = Math.floor(Math.random()*(i+1));
          [shuffledPost[i],shuffledPost[j]] = [shuffledPost[j], shuffledPost[i]]
          
      }
      return shuffledPost
  }
  // const getData
  const getData = async () => {
      try {
          const user = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
          setuser(user.data)
          const response = await api.get('/nivak/media/allpost/')
          const data = shufflePost(response.data)
          setallpost(data)
          setloading(false)
      } catch (error) {
          setloading(false)
      }
  }

  // to Open Each post
  const [selectedPostId, setSelectedPostId] = useState(null); // To store the selected postId
  const [overlaypost, setoverlaypost] = useState(false);
  const handleOverlayPost = (postId) => {
      setSelectedPostId(postId); // Set the selected postId
      setoverlaypost(true); // Open the OverlayPost component
  }
  const handleCloseOverlay = () =>{
    setoverlaypost(false)
  }

  useEffect(()=>{
      setloading(true)
      getData()
  },[])
  return (
    <div>
        {overlaypost && selectedPostId && (
          <OverlayPost postid={selectedPostId} onClose={handleCloseOverlay} className='post_overlaypost' />
        )}
        <div className='loading' style={loading?{display:'flex'}:{display:'none'}}>
          <SyncLoader
          color={'#36d7b7'}
          loading={loading}
          />
        </div>

        <div className='reels'>
            {/* Reels Side bar */}
            <div className='reels_sidebar'>
                <SideBar/>
            </div>
            <div className='reels_content'>
                <div className='reels_cards'>
                  {allpost?.map((post,index)=>{
                    if (post?.userId !== user?.userId && !user?.userFollowings?.includes(post?.userId)) {
                        const isVideo = post?.postURL && (post?.postURL.includes('.mp4') || post?.postURL.includes('.mov') || post?.postURL.includes('.avi'));
                        if(isVideo){
                          return(
                            <div key={index}>
                              {isVideo && <ReelsPost postid={post?.postId} handleOverlayPost={handleOverlayPost}/>}
                            </div>
                          )
                        }
                  }})}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Reels

const ReelsPost = ({postid,handleOverlayPost}) =>{ 
  
  const [post, setpost] = useState()
  const [user, setuser] = useState()
  const [postuser, setpostuser] = useState()
  const getData= async()=>{
    try {
      const post = await api.get(`/nivak/media/postbypostid/${postid}/`)
      setpost(post.data)
      const postuser = await api.get(`/nivak/media/byuserid/${post.data?.userId}/`)
      setpostuser(postuser.data)
    } catch (error) {
      
    }
  }

  const getUser = async()=>{
    try {
      const response = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
      setuser(response.data)
    } catch (error) {
      
    }
  }

  // Post Intraction

  const postIntraction = async () =>{
    const formData = new FormData()
    try {
        formData.append('postid',post?.postId)
        formData.append('userid',user?.userId)
        await api.post('/nivak/media/intraction/',formData,{
            headers: {
                'Content-Type' : 'form-data',
            }
        })
        getData()
    } catch (error) {
    }
  }

  //Video Controlls
  const [loadingpart, setloadingpart] = useState(true);

  const handleLoad=()=>{
    setloadingpart(false)
  }


  const isVideo = post?.postURL && (post?.postURL.includes('.mp4') || post?.postURL.includes('.mov') || post?.postURL.includes('.avi'));

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

  // User Friend Intractions
  const userFriend= async (friendUserid)=>{
    try {
        const formData = new FormData()
        formData.append('userid', user?.userId)
        formData.append('userfriendid', friendUserid)
        await api.post('/nivak/media/userfriend/',formData,{
            headers:{
                'Content-Type': 'form-data'
            }
        })
        getUser()
    } catch (error) {
    }
  }
  // SavePost
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
        getUser()
    } catch (error) {
        
    }
}

  useEffect(()=>{
    getData()
    getUser()
  },[])

  return(
    <div className='reels_card'>

      <div className='reels_media' ref={ref}>
          {/* Reels Container Left */}
          <div className='reels_container_left'>
              <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'326.53px',height:'580.5px',position:'absolute'} : { display: 'none' }}>
                  <DotLoader
                  size={50}
                  color={'#ffffff'}
                  loading={loadingpart}
                  />
              </div>
              <LazyLoadComponent>
                  <div style={{borderRadius:'8px', overflow:'hidden',position:'relative'}} className='reels_container_left_'>
                      <ReactPlayer
                          url={post?.postURL}
                          playing={play && inView }
                          loop
                          muted={mute}
                          width={'326.53px'}
                          height={'580.5px'}
                          onClick={()=>{setmute(pre=> !pre)}}
                          onReady={() => {
                              handleLoad()
                          }}
                          pip={false}
                          className="reels_container_left__"
                      />
                      <p className='play_button' onClick={()=>setplay(pre=> !pre)}>{play && inView ?<FaPause/>:<FaPlay/>}</p>
                      <div className='reels_intraction_div'>                         
                          <div className='reels_card_container'>
                            <div className='reels_card_top'>
                                <a href={`/account/profile/${postuser?.userName}/`}>
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
                                    <p>{postuser?.userName} • <button onClick={()=> userFriend(postuser?.userId)}>{user?.userFollowings?.includes(postuser?.userId)?<span>Unfollow</span>:<span>Follow</span>}</button></p>
                                </div>
                            </div>
                            <div className='reels_card_bottom'>
                              <p>{post?.postDescription}</p>
                            </div>
                          </div>
                      </div>
                  </div>
              </LazyLoadComponent>
          </div>

          {/* Reels Container Right */}
          <div className='reels_container_right'>
            <div className='reels_intraction'>
                <p onClick={postIntraction}>{post?.postLikes.includes(user?.userId)  ?<FaHeart style={{color:'red'}}/>:<FaRegHeart/>}<span>{post?.postLikes?.length}</span></p>
                <p onClick={() => {handleOverlayPost(post?.postId); setplay((prev)=> !prev)}}><FaRegComment/><span>{post?.postComments?.length}</span></p>
                <p><FaPaperPlane/></p>
                <p onClick={savePost}>{user?.savedPost && user?.savedPost?.includes(post?.postId)? <FaBookmark/> : <FaRegBookmark/>}</p>
                <p><BsThreeDots/></p>
            </div>
          </div>
      </div>

    </div>
  )
}

