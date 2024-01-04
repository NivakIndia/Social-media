import React, { useEffect, useState } from 'react'
import api from '../../api/axiosConfig'
import './FrontPage.css'
import SideBar from '../SideBar/SideBar'
import { SyncLoader } from 'react-spinners'
import Cookies from 'js-cookie'
import FrontPost from './FrontPageMedia/FrontPost'
import Suggestion from './Suggestion/Suggestion'


const FrontPage = () => {
  const [loading, setloading] = useState(false)
  
  const [posts, setposts] = useState()
  const [user, setuser] = useState()

  // Get Data from api
  const getData= async () =>{
    try {
      const user = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
      setuser(user.data)
      const posts = await api.get('/nivak/media/allpost/')
      setposts(posts.data)
      setloading(false)
    } catch (error) {
      setloading(false)
    }
    
  }

  // use Effects
  useEffect(()=>{
    setloading(true)
    getData()
  },[])
  return (
    <>
      <div className='loading' style={loading?{display:'flex'}:{display:'none'}}>
            <SyncLoader
            color={'#36d7b7'}
            loading={loading}
            />
      </div>

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
                          if (post?.userId === user?.userId || user?.userFollowings?.includes(post?.userId)) {
                            const dateTime = new Date(`${post?.postDate}T${post?.postTime}`).getTime()
                            sortedPosts.push({ dateTime, post })
                          }
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
