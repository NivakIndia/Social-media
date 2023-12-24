import React, { useEffect, useState } from 'react'
import './Explore.css'
import api from '../../api/axiosConfig'
import SideBar from '../SideBar/SideBar'
import Cookies from 'js-cookie'
import OverlayPost from '../OverlayPost/OverlayPost'
import { DotLoader, SyncLoader } from 'react-spinners'
import { FaVideo } from 'react-icons/fa'
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component'

const Explore = () => {
    const [allpost, setallpost] = useState()
    const [user, setuser] = useState()
    const [loading, setloading] = useState(false)
    const [loadingpart, setloadingpart] = useState(true);

    const handleLoad = () => {
        setloadingpart(false)
      }

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

    useEffect(()=>{
        setloading(true)
        getData()
    },[])

  return (
    <div>
        {overlaypost && selectedPostId && (
          <OverlayPost postid={selectedPostId} onClose={() => setoverlaypost(false)} className='post_overlaypost' />
        )}
        <div className='loading' style={loading?{display:'flex'}:{display:'none'}}>
            <SyncLoader
            color={'#36d7b7'}
            loading={loading}
            />
        </div>

        <div className='explore'>
            {/* Explore Side bar */}
            <div className='explore_sidebar'>
                <SideBar/>
            </div>

            {/* Explore Content */}
            <div className='explore_content'>
                <div className='explore_row'>
                    {allpost?.map((post,index)=>{
                        if( post?.userId !== user?.userId && !user?.userFollowings?.includes(post?.userId)){
                            const isImage = post?.postURL && (post.postURL?.includes('.jpg') || post?.postURL.includes('.png') || post?.postURL.includes('.jpeg'));
                            const isVideo = post?.postURL && (post?.postURL.includes('.mp4') || post?.postURL.includes('.mov') || post?.postURL.includes('.avi'));
                            return(
                                <div className='explore_column' key={index}>
                                    <div className='explore_cards'>
                                        <div className='explore_card' onClick={() => handleOverlayPost(post?.postId)}>
                                            {isImage && (
                                                <>
                                                    <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'300px',height:'350px'} : { display: 'none' }}>
                                                        <DotLoader
                                                        size={50}
                                                        color={'#ffffff'}
                                                        loading={loadingpart}
                                                        />
                                                    </div>
                                                    <LazyLoadImage
                                                        key={post?.userId}
                                                        width={300}
                                                        height={350}
                                                        src={post?.postURL}
                                                        onLoadedMetadata={handleLoad}
                                                        effect={'blur'}
                                                        placeholderSrc={post?.postURL}
                                                        className='explore_media'
                                                    />
                                                </>
                                            )}

                                            {isVideo && (
                                                <>
                                                    <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'300px',height:'350px'} : { display: 'none' }}>
                                                        <DotLoader
                                                        size={50}
                                                        color={'#ffffff'}
                                                        loading={loadingpart}
                                                        />
                                                    </div>
                                                    <LazyLoadComponent>
                                                        <video loop muted className='explore_media' onLoadedMetadata={handleLoad}>
                                                            <source src={post?.postURL} type='video/mp4' />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                        <p className='explore_media_icon'><FaVideo/></p>
                                                    </LazyLoadComponent>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Explore
