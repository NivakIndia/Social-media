import React, { useEffect, useState } from 'react'
import api from '../../api/axiosConfig'
import './FrontPage.css'
import SideBar from '../SideBar/SideBar'
import { SyncLoader } from 'react-spinners'
import Cookies from 'js-cookie'
import FrontPost from './FrontPageMedia/FrontPost'
import Suggestion from './Suggestion/Suggestion'
import ApiFunctions from '../../ApiFunctions'


const FrontPage = () => {
  const { toGetFrontPosts } = ApiFunctions()
  const [posts, setposts] = useState()

  // Get posts from api
  const getPosts= async () =>{
    setposts((await toGetFrontPosts({id: Cookies.get("_id")})).data.data)
  }

  useEffect(()=>{
    getPosts()
  },[])
  
  return (
    <>
      <div className='frontpage'>

          {/* Side Bar div */}
          <div className='frontpage_sidebar'>
              <SideBar/>
          </div>
          
          {/* Content Page div */}
          <div className='frontpage_content'>

              {/* Left Content */}
              <div className='frontpage_left'>
                <div className='frontpage_left_top'>
                </div>
                <div className='frontpage_left_bottom'>
                  <div className='frontpage_left_bottom_cards'>
                    {
                      posts?.reduce((sortedPosts, post) => {
                          
                          const dateTime = new Date(`${post?.postDate}T${post?.postTime}`).getTime()
                          sortedPosts.push({ dateTime, post })
                          return sortedPosts
                        }, [])
                          .sort((a, b) => b.dateTime - a.dateTime) // Sort based on timestamp in descending order (newest first)
                          .map(({post},index) => {
                            return(
                                <FrontPost key={index} post={post}/>
                            )
                    })}
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className='frontpage_right'>
                <Suggestion/>
              </div>

          </div>
      </div>
    </>
  )
}

export default FrontPage
