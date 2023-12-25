import React, { useEffect, useState } from 'react'
import api from '../../api/axiosConfig'
import { RxCross1 } from "react-icons/rx";
import './Friends.css'
import { Avatar } from '@mui/material';
import Cookies from 'js-cookie';
import { DotLoader } from 'react-spinners';

const Friends = ({status,profileuser,onClose}) => {
    const [alluser, setalluser] = useState()
    
    const getAllUser=async()=>{
        try {
            const response = await api.get('/nivak/media/allusers/')
            setalluser(response.data)
        } catch (error) {
            
        }
    }

    // To search
    const [searchUser, setsearchUser] = useState('');
    const SearchUser = (e) => {
        setsearchUser(e.target.value);
    };
    
    const filteredUsers = alluser?.filter((user) =>
        user.userName.toLowerCase().startsWith(searchUser.toLowerCase())
    );

    useEffect(()=>{
        getAllUser()
    },[])
  return (
    <div className='friend_'>
        <button onClick={onClose}><RxCross1/></button>
        <div className='friend'>
            {/* Friend Top */}
            <div className='friend_top'>
                {status === 'follow' && <p>Followers</p>}
                {status === 'following' && <p>Following</p>}
                {status === 'search' && <p>Search</p>}
            </div>

            {/* Friend Middle */}
            <div className='friend_middle'>
                <input type='text' placeholder={status==='search'? 'Search...' : 'Search... *In future Updates*'} value={searchUser} onChange={SearchUser} disabled={status==='search'? false : true}/>
            </div>

            {/* Friend Bottom */}
            <div className='friend_bottom_'>
                <div className='friend_bottom'>
                    {status === 'follow' && (
                        <>
                            {profileuser?.userFollowers?.map((followers,index)=>{
                                return(
                                    <EachFriends key={index} user={followers}  currentuser={profileuser}/>
                                )
                            })}
                        </>
                    )}
                    {status === 'following' && (
                        <>
                            {profileuser?.userFollowings?.map((followings,index)=>{
                                return(
                                    <EachFriends key={index} user={followings} currentuser={profileuser}/>
                                )
                            })}
                        </>
                    )}
                    {status === 'search' &&
                        <>
                            {
                                searchUser !== '' && 
                                filteredUsers?.map((user, index) => (
                                    <EachFriends key={index} user={user?.userId} currentuser={profileuser} />
                                ))
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    </div>
  )
}

export default Friends

const EachFriends = ({user,currentuser}) => {

    const [eachfriend, seteachfriend] = useState()
    const [loadingpart, setloadingpart] = useState(false)
    
    const getEachFriend = async() =>{
        setloadingpart(true)
        try {
            const response = await api.get(`/nivak/media/byuserid/${user}/`)
            seteachfriend(response.data)
            setloadingpart(false)
        } catch (error) {
            setloadingpart(false)
        }
    }

    // Get User
    const [userin, setuserin] = useState()

    const getUserIn = async () => {
        try {
            const response = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
            setuserin(response.data)
            setloadingpart(false)
        } catch (error) {
            setloadingpart(false)
        }
    }

    // User Friend Intractions
    const userFriend= async (friendUserid)=>{
        try {
            const formData = new FormData()
            formData.append('userid', currentuser?.userId)
            formData.append('userfriendid', friendUserid)
            await api.post('/nivak/media/userfriend/',formData,{
                headers:{
                    'Content-Type': 'form-data'
                }
            })
            getUserIn()
        } catch (error) {
        }
    }

    useEffect(()=>{
        setloadingpart(true)
        getUserIn()
        getEachFriend()
    },[])

    return(
        <>
            <div  className='eachfriend'>
                <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'100%',height:'100%'} : { display: 'none' }}>
                    <DotLoader
                    size={50}
                    color={'#ffffff'}
                    loading={loadingpart}
                    />
                </div>

                <div className='eachfriend_avatar'>
                <a href={`/account/profile/${eachfriend?.userName}/`}>
                    <Avatar style={{width:'42px',height:'42px'}}>
                        {eachfriend?.profileURL ? <img src={eachfriend?.profileURL} style={{width:'42px',height:'42px'}}/> : <img src='/profile.png' style={{width:'42px',height:'42px'}}/>}
                    </Avatar>
                </a>
                </div>

                <div className='eachfriend_content'>
                    <p>{eachfriend?.userName}</p>
                    <span>{eachfriend?.fullName}</span>
                </div>

                <div className='eachfriend_button'>
                    {eachfriend?.userId !== userin?.userId ? <p onClick={()=> userFriend(eachfriend?.userId)}>{userin?.userFollowings?.includes(eachfriend?.userId)?<span>Unfollow</span>:<span>Follow</span>}</p>: <p style={{color:'#ffffff'}}>you</p>}
                </div>
            </div>
        </>
    )
}
