import React, { useEffect, useState } from 'react';
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component';
import './MediaView.css';
import OverlayPost from '../../OverlayPost/OverlayPost';
import { FaVideo } from 'react-icons/fa';
import ImageLoading from '../../../Others/ImageLoading';
import ApiFunctions from '../../../ApiFunctions';
import Functions from '../../../Functions';

const MediaView = ({ inPost, posts, userId, getuser }) => {
  const { toGetSavedPosts } =  ApiFunctions()
  const [savedPost, setsavedPost] = useState()  
  
  const getSavedPost=async()=>{
    setsavedPost((await toGetSavedPosts({userId: userId})).data.data)
  }

  // to Open Each post
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [overlaypost, setoverlaypost] = useState(false);
  const handleOverlayPost = (postId) => {
    setSelectedPostId(postId);
    setoverlaypost(true);
  }

  const closeOverlayPost=()=>{
    setoverlaypost(false)
  }

  useEffect(()=>{
      if(inPost === "saves") getSavedPost();
  },[inPost])
  
    
  return (
    <>
      {overlaypost && selectedPostId && (
          <OverlayPost postid={selectedPostId} onClose={closeOverlayPost} className='post_overlaypost' />
        )}
      <div>
        {/* Post */}
        {inPost==='post' && (
          <div className='post_row'>
            {posts?.map((post, index) => {
              
              return (
                <LoadMedia postId={post} type={inPost} key={index} handleOverlayPost={handleOverlayPost}/>
              );
            })}
          </div>
        ) }

        {/* Reels */}
        { inPost === 'reels' && (
          <div className='reel_row'>
            {posts?.map((post, index) => {
              return (
                <LoadMedia postId={post} type={inPost} key={index} handleOverlayPost={handleOverlayPost}/>
              );
            })}
          </div>
        )}

        {/* Saves */}
        {inPost==='saves' && (
          <div className='post_row'>
            {savedPost?.map((post, index) => {
              
              return (
                <LoadMedia postId={post} type={inPost} key={index} handleOverlayPost={handleOverlayPost}/>
              );
            })}
          </div>
        ) }
      </div>
    </>
    
  );
};

export default MediaView;


const LoadMedia = ({postId, type, handleOverlayPost}) => {

  const { toGetPost } = ApiFunctions();
  const { toCheckIsImage, toCheckIsVideo } = Functions();

  const [loader, setloader] = useState(false)
  const [post, setpost] = useState()
  const [isImage, setisImage] = useState(false)
  const [isVideo, setisVideo] = useState(false)
  

  const getPost = async()=>{
    setloader(true)
     try {
      const post = await (await toGetPost({postId: postId})).data.data
      
      setpost(post)
      
      setisImage(toCheckIsImage({url: post.postURL}))
      setisVideo(toCheckIsVideo({url: post.postURL}))
      setloader(false)
      
     } catch (error) {
     }
  }

  useEffect(() => {
    getPost()
  }, [])
  
  

  return (
    <>
      {(type === "post" || type === "saves") && 
        <div className='post_column'>
          <div className='post_cards'>  
            <div className='post_card' onClick={() => handleOverlayPost(post?.id)}>
              {
                loader ? <ImageLoading/>
                :
                <>
                  {isImage && (
                      <div className='post_card_'>
                          <LazyLoadImage
                              key={post?.userId}
                              width={273.33}
                              height={273.33}
                              src={post?.postURL}
                              effect={'blur'}
                              placeholderSrc={post?.postURL}
                              className='post_media'
                          />
                      </div>
                  )}

                  {isVideo && (
                    <LazyLoadComponent>
                        <video loop muted className='post_media'>
                        <source src={post?.postURL} type='video/mp4' />
                        Your browser does not support the video tag.
                        </video>
                        <p className='reel_media_icon'><FaVideo/></p>
                    </LazyLoadComponent>
                  )}
                </>
              }
              
            </div>
          </div>
        </div>
      }
      {type === 'reels' &&
        <div className='reel_column'>
          {isVideo && (
            <div className='reel_cards'>
              <div className='reel_card' onClick={() => handleOverlayPost(post?.id)}>
                  {loader ? <ImageLoading/> :
                  <LazyLoadComponent>
                    <video loop muted className='post_media'>
                    <source src={post?.postURL} type='video/mp4' />
                    Your browser does not support the video tag.
                    </video>
                    <p className='reel_media_icon'><FaVideo/></p>
                  </LazyLoadComponent>
                  }
              </div>
            </div>
          )}
        </div>
      }
    </>
  )
}
