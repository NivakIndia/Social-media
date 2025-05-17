import React, { useEffect, useState } from 'react'
import api from '../../api/axiosConfig'
import { RxCross1 } from "react-icons/rx";
import './Friends.css'
import { Avatar } from '@mui/material';
import Cookies from 'js-cookie';
import ApiFunctions from '../../ApiFunctions';
import ImageLoading from '../../Others/ImageLoading';

const Friends = ({status,onClose, userId}) => {
    const [alluser, setalluser] = useState()
    const { getUserIdAndNames, toGetUserFriends} = ApiFunctions()
    const getAllUser=async()=>{
       if(status === 'search'){
           setalluser((await getUserIdAndNames()).data.data)
       }
       else{
           setalluser((await toGetUserFriends({id:userId, type: status})).data.data)
       }
    }

    // To search
    const [searchUser, setsearchUser] = useState('');
    const SearchUser = (e) => {
        setsearchUser(e.target.value);
    };
    
    const filteredUsers = alluser?.filter((user) =>
        user.userName.toLowerCase().startsWith(searchUser.toLowerCase()) || user.fullName.toLowerCase().startsWith(searchUser.toLowerCase())
    );

    useEffect(()=>{
        getAllUser()
    },[status])
  return (
    <div className='friend_'>
        <button onClick={onClose}><RxCross1/></button>
        <div className='friend'>
            <div className="friend_title">
                {/* Friend Top */}
                <div className='friend_top'>
                    {status === 'followers' && <p>Followers</p>}
                    {status === 'followings' && <p>Following</p>}
                    {status === 'search' && <p>Search</p>}
                </div>

                {/* Friend Middle */}
                <div className='friend_middle'>
                    <input type='text' placeholder={'Search...'} value={searchUser} onChange={SearchUser}/>
                </div>
            </div>

            {/* Friend Bottom */}
            <div className='friend_bottom_'>
                <div className='friend_bottom'>
                    {   ((status === "search" && searchUser !== '' || status !== "search")) &&
                        filteredUsers?.map((user, index) => (
                            <EachFriends key={index} user={user?.id}/>
                        ))
                    }
                </div>
            </div>
        </div>
    </div>
  )
}

export default Friends

const EachFriends = ({user}) => {
    const { toGetUserData, forFriendIntractions } = ApiFunctions()

    const [eachfriend, seteachfriend] = useState()
    const [loading, setloading] = useState(false)
    
    const getEachFriend = async() =>{
        setloading(true)
       seteachfriend((await toGetUserData({id:user})).data.data)
       setloading(false)
    }

    // Get User
    const [userin, setuserin] = useState()

    const getUserIn = async () => {
        setuserin((await toGetUserData({id:Cookies.get("_id")})).data.data)
    }

    // User Friend Intractions
    const userFriend= async (friendUserid)=>{
        await forFriendIntractions({userId: Cookies.get("_id"), userFriendId: friendUserid})
        getUserIn();
    }

    useEffect(()=>{
        setloading(true)
        getUserIn()
        getEachFriend()
    },[])

    

    return(
        <>
            {loading ? <ImageLoading isBackground={true}/> :
                <div  className='eachfriend'>
                    <div className='eachfriend_avatar'>
                    <a href={`/account/profile/${eachfriend?.id}/`}>
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
                        {eachfriend?.id !== userin?.id ? <p onClick={()=> userFriend(eachfriend?.id)}>{userin?.userFollowings?.includes(eachfriend?.id)?<span>Unfollow</span>:<span>Follow</span>}</p>: <p></p>}
                    </div>
                </div>
            }
        </>
    )
}
