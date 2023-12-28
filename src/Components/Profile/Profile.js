import React, { useEffect, useState } from 'react'
import './Profile.css'
import api from "../../api/axiosConfig"
import Cookies from 'js-cookie'
import SideBar from '../SideBar/SideBar'
import { Avatar } from '@mui/material'
import { VscSettingsGear } from "react-icons/vsc";
import { BsGrid3X3, BsPlayBtnFill } from "react-icons/bs";
import { useLocation } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import {SyncLoader} from "react-spinners";
import MediaView from './ProfileMediaShow/MediaView'
import Friends from '../Friends/Friends'
import { FaBookmark } from 'react-icons/fa'

const Profile = () => {
    const [user, setuser] = useState()
    const [posts, setposts] = useState()
    const [isUser, setisUser] = useState()
    const [inPost, setinPost] = useState('post')
    const [isPost, setisPost] = useState(true)
    const [isReels,setisReels] = useState(false)
    const [isSaves, setisSaves] = useState(false)
    const [loading, setloading] = useState(false)

    // Get userName from PathURL
    const location = useLocation()
    const path = location.pathname
    const parts = path.split("/")

  // Get Login User data
  const getUser=async()=>{
    try {
        const isUser = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
        setisUser(isUser.data)
        const user = await api.get(`/nivak/media/byusername/${parts[parts.length-2]}/`)
        setuser(user.data)
        const posts = await api.get(`/nivak/media/postbyuserid/${user.data?.userId}/`)
        setposts(posts.data.reverse())
        setloading(false)
    } catch (error) {
        setloading(false)
    }
  }

  // User Friend Intractions
  const userFriend= async ()=>{
    try {
        const formData = new FormData()
        formData.append('userid', isUser?.userId)
        formData.append('userfriendid', user?.userId)
        await api.post('/nivak/media/userfriend/',formData,{
            headers:{
                'Content-Type': 'form-data'
            }
        })
        getUser()
    } catch (error) {
    }
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

  // UseEffect
  useEffect(() => {
    setloading(true)
    getUser()
  }, [])
  return (
    <>
        {friendstatus && (
          <Friends status={frndstatus} profileuser={user} onClose={handleCloseStatus} />
        )}
        <div className='loading' style={loading?{display:'flex'}:{display:'none'}}>
            <SyncLoader
            color={'#36d7b7'}
            loading={loading}
            />
        </div>
        <div className='profile'>
            {/* Profile Sidebar */}
            <div className='profile_sidebar'>
                <SideBar/>
            </div>

            {/* Profile Content */}
            <div className='profile_content'>
                {/* Profile Content Top */}
                <div className='profile_top'>
                    <div className='profile_top_avatar'>
                        <Avatar className='profile_top_avatar_class'>
                        
                            <LazyLoadImage key={user?.userId} src={user?.profileURL ? user?.profileURL : '/profile.png'} width={150} height={150} effect="blur"
                                placeholderSrc={user?.profileURL ? user?.profileURL : '/profile.png'} className='profile_image'/>
                          
                        </Avatar>
                        
                    </div>
                    <div className='profile_top_content'>
                        <div className='profile_top_content_top'>
                            {
                                isUser && user && isUser?.userId === user?.userId ? (
                                    <>
                                        <p>{user?.userName}</p>
                                        <a href='/account/edit/'><button>Edit Profile</button></a>
                                        <a><button disabled style={{cursor:"not-allowed"}}>View Archive</button></a>
                                        <h2><VscSettingsGear/></h2>
                                    </>
                                ):(
                                    <>
                                        <p>{user?.userName}</p>
                                        <button onClick={userFriend}>
                                            {
                                                !user?.userFollowers?.includes(isUser?.userId)?(
                                                    <span>Follow</span>
                                                ):(
                                                    <span>Unfollow</span>
                                                )
                                            }
                                        </button>
                                        <button style={{background:'#515151'}}>Message</button>
                                        <h2><VscSettingsGear/></h2>
                                    </>
                                )
                            }
                        </div>
                        <div className='profile_top_content_middle'>
                            <p>{posts? posts.length : 0} Post</p>
                            <p onClick={()=>handlestatus('follow')}>{user?.userFollowers ? user?.userFollowers.length : 0} followers</p>
                            <p onClick={()=>handlestatus('following')}>{user?.userFollowings ? user?.userFollowings.length : 0} following</p>
                        </div>
                        <div className='profile_top_content_bottom'>
                            <p>{user?.fullName}</p>
                            <div className='bio'>
                                {user?.userBio && user?.userBio.split(';').map((line,index)=>(
                                    <p  key={index}><span>{line}</span></p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content Middle */}
                <div className='profile_middle'>
                    <p className={isPost ?'in':''} onClick={()=>{setisPost(true); setisSaves(false); setisReels(false); setinPost('post')}}><BsGrid3X3/> <span>POSTS</span></p>
                    <p className={isReels ?'in':''} onClick={()=>{setisPost(false); setisReels(true); setisSaves(false); setinPost('reels')}}><BsPlayBtnFill/> <span>REELS</span></p>
                    <p className={isSaves ?'in':''} onClick={()=>{setisPost(false); setisReels(false); setisSaves(true); setinPost('saves')}}><FaBookmark/> <span>SAVED</span></p>
                </div>
                
                {/* Profile Content Bottom */}
                <div className='profile_bottom'>
                    <div className='profile_bottom_container'>
                        <MediaView inPost={inPost} posts={posts} user={user} getuser={getUser}/>
                    </div>
                </div>

            </div>
        </div>
    </>
  )
}

export default Profile
