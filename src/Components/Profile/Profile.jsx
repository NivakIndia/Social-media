import React, { useEffect, useState } from 'react'
import './Profile.css'
import Cookies from 'js-cookie'
import SideBar from '../SideBar/SideBar'
import { Avatar } from '@mui/material'
import { VscSettingsGear } from "react-icons/vsc";
import { BsGrid3X3, BsPlayBtnFill } from "react-icons/bs";
import { useLocation } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import MediaView from './ProfileMediaShow/MediaView'
import Friends from '../Friends/Friends'
import { FaBookmark } from 'react-icons/fa'
import ImageLoading from '../../Others/ImageLoading'
import ApiFunctions from '../../ApiFunctions'

const Profile = () => {

    const { toGetUserData, toGetProfilePosts, forFriendIntractions } = ApiFunctions()

    const location = useLocation()
    const [user, setuser] = useState()
    const [posts, setPosts] = useState()
    const [current_user, setcurrent_user] = useState()
    const [inPost, setinPost] = useState('post')
    const [isPost, setisPost] = useState(true)
    const [isReels,setisReels] = useState(false)
    const [isSaves, setisSaves] = useState(false)


    const [profileLoading, setprofileLoading] = useState(false);

  // Get Login User data
  const getUser=async()=>{
    setprofileLoading(true)
    const path = location.pathname
    const parts = path.split("/")
    const id = parts[parts.length-2];
    
    try {
        setcurrent_user((await toGetUserData({id:Cookies.get("_id")})).data.data)
        setuser((await toGetUserData({id:id})).data.data)

        setPosts((await toGetProfilePosts({id:id})).data.data)
        
        setprofileLoading(false)
    } catch (error) {
        
    }
    
  }

  const getUserAgain = async (id) => {
    setcurrent_user((await toGetUserData({id:Cookies.get("_id")})).data.data)
    setuser((await toGetUserData({id:id})).data.data)
  }

  // User Friend Intractions
  const userFriend= async ()=>{
    await forFriendIntractions({userId: current_user?.id, userFriendId: user?.id})
    getUserAgain(user?.id)
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
    getUserAgain(user.id)
  }

  // UseEffect
  useEffect(() => {
    getUser()
  }, [])

  return (
    <>
        {friendstatus && (
          <Friends status={frndstatus} onClose={handleCloseStatus} userId={user?.id}/>
        )}
        <div className='profile'>
            {/* Profile Sidebar */}
            <div className='profile_sidebar'>
                <SideBar/>
            </div>

            {/* Profile Content */}
            <div className='profile_content'>
                { profileLoading ? 
                    <ImageLoading />
                :
                    <>
                        {/* Profile Content Top */}
                        <div className='profile_top'>
                            <div className='profile_top_avatar'>
                                <Avatar className='profile_top_avatar_class'>
                                
                                    <LazyLoadImage key={user?.userId} src={user?.profileURL ? user?.profileURL : '/profile.png'} width={150} height={150} effect="blur"
                                        placeholderSrc={user?.profileURL ? user?.profileURL : '/profile.png'}/>
                                
                                </Avatar>
                                
                            </div>
                            <div className='profile_top_content'>
                                <div className='profile_top_content_top'>
                                    {
                                        current_user && user && current_user?.userId === user?.userId ? (
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
                                                        !user?.userFollowers?.includes(current_user?.id)?(
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
                                    <p onClick={()=>handlestatus('followers')}>{user?.userFollowers ? user?.userFollowers.length : 0} followers</p>
                                    <p onClick={()=>handlestatus('followings')}>{user?.userFollowings ? user?.userFollowings.length : 0} following</p>
                                </div>
                                <div className='profile_top_content_bottom'>
                                    <p>{user?.fullName}</p>
                                    <div className='bio'>
                                        {user?.userBio && 
                                            <textarea disabled value={user?.userBio} className='bio_textarea' />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Content Middle */}
                        <div className='profile_middle'>
                            <p className={isPost ?'in':''} onClick={()=>{setisPost(true); setisSaves(false); setisReels(false); setinPost('post')}}><BsGrid3X3/> <span>POSTS</span></p>
                            <p className={isReels ?'in':''} onClick={()=>{setisPost(false); setisReels(true); setisSaves(false); setinPost('reels')}}><BsPlayBtnFill/> <span>REELS</span></p>
                            {current_user && user && current_user?.userId === user?.userId && <p className={isSaves ?'in':''} onClick={()=>{setisPost(false); setisReels(false); setisSaves(true); setinPost('saves')}}><FaBookmark/> <span>SAVED</span></p>}
                        </div>
                        
                        {/* Profile Content Bottom */}
                        <div className='profile_bottom'>
                            <div className='profile_bottom_container'>
                                <MediaView inPost={inPost} posts={posts} userId={Cookies.get("_id")} getuser={getUser}/>
                            </div>
                        </div>
                    </>
                }
            </div>
        </div>
    </>
  )
}

export default Profile
