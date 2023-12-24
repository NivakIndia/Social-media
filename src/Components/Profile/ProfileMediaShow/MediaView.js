import React, { useState } from 'react';
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component';
import './MediaView.css';
import { DotLoader } from 'react-spinners';
import OverlayPost from '../../OverlayPost/OverlayPost';
import { FaVideo } from 'react-icons/fa';

const MediaView = ({ inPost, posts }) => {
  const [loadingpart, setloadingpart] = useState(true);

  const handleLoad = () => {
    setloadingpart(false)
  }

  // to Open Each post
  const [selectedPostId, setSelectedPostId] = useState(null); // To store the selected postId
  const [overlaypost, setoverlaypost] = useState(false);
  const handleOverlayPost = (postId) => {
    setSelectedPostId(postId); // Set the selected postId
    setoverlaypost(true); // Open the OverlayPost component
  }
    
  return (
    <>
      {overlaypost && selectedPostId && (
          <OverlayPost postid={selectedPostId} onClose={() => setoverlaypost(false)} className='post_overlaypost' />
        )}
      <div>
        {inPost ? (
          <div className='post_row'>
            {posts?.map((post, index) => {
              const isImage = post?.postURL && (post.postURL?.includes('.jpg') || post?.postURL.includes('.png') || post?.postURL.includes('.jpeg'));
              const isVideo = post?.postURL && (post?.postURL.includes('.mp4') || post?.postURL.includes('.mov') || post?.postURL.includes('.avi'));
              

              return (
                <div className='post_column' key={index}>
                  <div className='post_cards'>
                    <div className='post_card' onClick={() => handleOverlayPost(post?.postId)}>
                      {isImage && (
                          <>
                              <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'273.33px',height:'273.33px'} : { display: 'none' }}>
                                  <DotLoader
                                  size={50}
                                  color={'#ffffff'}
                                  loading={loadingpart}
                                  />
                              </div>
                              <LazyLoadImage
                                  key={post?.userId}
                                  width={273.33}
                                  height={273.33}
                                  src={post?.postURL}
                                  onLoadedMetadata={handleLoad}
                                  effect={'blur'}
                                  placeholderSrc={post?.postURL}
                                  className='post_media'
                              />
                          </>
                      )}

                      {isVideo && (
                          <>
                              <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'273.33px',height:'273.33px'} : { display: 'none' }}>
                                  <DotLoader
                                  size={50}
                                  color={'#ffffff'}
                                  loading={loadingpart}
                                  />
                              </div>
                              <LazyLoadComponent>
                                  <video loop muted className='post_media' onLoadedMetadata={handleLoad}>
                                  <source src={post?.postURL} type='video/mp4' />
                                  Your browser does not support the video tag.
                                  </video>
                                  <p className='reel_media_icon'><FaVideo/></p>
                              </LazyLoadComponent>
                          </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='reel_row'>
            {posts?.map((post, index) => {
              const isVideo = post?.postURL && (post?.postURL.includes('.mp4') || post?.postURL.includes('.mov') || post?.postURL.includes('.avi'));

              return (
                <div className='reel_column' key={index}>
                  {isVideo && (
                    <div className='reel_cards'>
                      <div className='reel_card' onClick={() => handleOverlayPost(post?.postId)}>
                          <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'204px',height:'317.54px'} : { display: 'none' }}>
                              <DotLoader
                              size={50}
                              color={'#ffffff'}
                              loading={loadingpart}
                              />
                          </div>
                          <LazyLoadComponent>
                              <video loop muted className='post_media' onLoadedMetadata={handleLoad}>
                              <source src={post?.postURL} type='video/mp4' />
                              Your browser does not support the video tag.
                              </video>
                              <p className='reel_media_icon'><FaVideo/></p>
                          </LazyLoadComponent>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
    
  );
};

export default MediaView;
