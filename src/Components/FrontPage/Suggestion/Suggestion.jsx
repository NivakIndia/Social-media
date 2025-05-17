import React, { useEffect, useState } from 'react'
import api from '../../../api/axiosConfig'
import './Suggestion.css'
import Cookies from 'js-cookie'
import { Avatar } from '@mui/material'
import ApiFunctions from '../../../ApiFunctions'

const Suggestion = () => {
  const { toGetUserData, forFriendIntractions, toGetSuggestions } = ApiFunctions()
  const [user, setUser] = useState()
  const [suggestios, setSuggestions] = useState()

  /* Get the User */
  const GetUser = async()=>{
    setUser((await toGetUserData({id:Cookies.get("_id")})).data.data)
  }

  /* Get the Suggestions */
  const GetSuggestions = async()=>{
    setSuggestions((await toGetSuggestions()).data.data)
    
  }

  /* Friend Intractions */
  const FriendIntraction= async (friendUserid)=>{
    await forFriendIntractions({userId: user?.id, userFriendId: friendUserid})
    GetUser()
  }



  // UseEffect
  useEffect(()=>{
    GetUser()
    GetSuggestions()
  },[])

  return (
    <div className='suggestion'>

        <div className='suggestion_top_'>
          <div className='suggestion_top'>
            
            <div className='suggestion_top_avatar'>
              <a href={`/account/profile/${user?.id}/`}>
                <Avatar style={{width:'42px',height:'42px'}}>
                    {user?.profileURL ? <img src={user?.profileURL} style={{width:'42px',height:'42px'}}/> : <img src='/profile.png' style={{width:'42px',height:'42px'}}/>}
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
            {suggestios?.map((suggest,index)=>{                  
              if(index < 5){
                return(
                  <div  className='suggestion_bottom' key={index} title='Click Image to go pofile'>
                    <div className='suggestion_bottom_avatar'>
                      <a href={`/account/profile/${suggest?.id}/`}>
                        <Avatar style={{width:'42px',height:'42px'}}>
                            {suggest?.profileURL ? <img src={suggest?.profileURL} style={{width:'42px',height:'42px'}}/> : <img src='/profile.png' style={{width:'42px',height:'42px'}}/>}
                        </Avatar>
                      </a>
                    </div>
    
                    <div className='suggestion_bottom_content'>
                        <p>{suggest?.userName}</p>
                        <span>{suggest?.fullName}</span>
                    </div>
    
                    <div className='suggestion_bottom_button'>
                      <p onClick={()=> FriendIntraction(suggest?.id)}>{user?.userFollowings?.includes(suggest?.id)?<span>Unfollow</span>:<span>Follow</span>}</p>
                    </div>
                </div>
                )
              }
            })}
        </div>
        
    </div>
  )
}

export default Suggestion

