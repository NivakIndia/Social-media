import React, { useEffect, useState } from 'react'
import api from '../../../api/axiosConfig'
import './Suggestion.css'
import Cookies from 'js-cookie'
import { Avatar } from '@mui/material'

const Suggestion = () => {
  const [user, setuser] = useState()
  const [allUsers, setallUsers] = useState()

  // Get Data from api
  const shuffleData = (array) => {
    const shuffledData = [...array];
    for (let i = shuffledData?.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
    }
    return shuffledData;
  };

  const getUser = async()=>{
    try {
      const response = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
      setuser(response.data)
    } catch (error) {
    }

  }
  const getAllUser = async()=>{
    try {
      const response = await api.get(`/nivak/media/allusers/`)
      const data = shuffleData(response.data)
      setallUsers(data)
    } catch (error) {
    }
  }

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



  // UseEffect
  useEffect(()=>{
    getUser()
    getAllUser()
  },[])

  return (
    <div className='suggestion'>

        <div className='suggestion_top_'>
          <div className='suggestion_top'>
            
            <div className='suggestion_top_avatar'>
              <a href={`/account/profile/${user?.userName}/`}>
                <Avatar>
                    {user?.profileURL ? <img src={user?.profileURL}/> : <img src='/profile.png'/>}
                </Avatar>
              </a>
            </div>

            <div className='suggestion_top_content'>
                <p>{user?.userName}</p>
                <span>{user?.fullName}</span>
            </div>

            <div className='suggestion_top_button'>
              <a href='/'>switch</a>
            </div>
          </div>
        </div>

        <div className='suggestion_middle_'>
          <div className='suggestion_middle'>
              <p>Suggested for you</p>
              <span>See All</span>
          </div>
        </div>
        
        <div className='suggestion_bottom_'>
          <div>
            {allUsers?.map((alluser,index)=>{
              if (user?.userId !== alluser?.userId) {
                if (index<=5 && !alluser?.userFollowers.includes(user?.userId)) {
                  return(
                    <div  className='suggestion_bottom' key={index}>
                      <div className='suggestion_bottom_avatar'>
                        <a href={`/account/profile/${alluser?.userName}/`}>
                          <Avatar>
                              {alluser?.profileURL ? <img src={alluser?.profileURL}/> : <img src='/profile.png'/>}
                          </Avatar>
                        </a>
                      </div>
      
                      <div className='suggestion_bottom_content'>
                          <p>{alluser?.userName}</p>
                          <span>{alluser?.fullName}</span>
                      </div>
      
                      <div className='suggestion_bottom_button'>
                        <p onClick={()=> userFriend(alluser?.userId)}>{user?.userFollowings?.includes(alluser?.userId)?<span>Unfollow</span>:<span>Follow</span>}</p>
                      </div>
                  </div>
                  )
            }}})}
          </div>
        </div>
    </div>
  )
}

export default Suggestion
