import React, { useState } from 'react';
import './PostView.css';
import { DotLoader } from 'react-spinners';

const PostView = ({ postPreview, rightborder }) => {
  const [mute, setMute] = useState(false);
  const [loadingpart, setloadingpart] = useState(true);

  const handleLoad = () => {
    setloadingpart(false);
  };

  return (
    <>
      <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'426px',height:'426px'} : { display: 'none' }}>
        <DotLoader
          size={50}
          color={'#ffffff'}
          loading={loadingpart}
        />
      </div>
      <div className='postpreview_container'>
        {postPreview.startsWith('data:image') ? (
          <img
            src={postPreview}
            className='reactcrop_image'
            style={rightborder ? { borderBottomRightRadius: '15px' } : {}}
            onLoad={handleLoad} // Set loading to false once image is loaded
          />
        ) : (
          <video
            loop
            autoPlay
            onClick={() => setMute(prev => !prev)}
            muted={mute}
            style={rightborder ? { borderBottomRightRadius: '15px' } : {}}
            onLoadedData={handleLoad} // Set loading to false once video is loaded
          >
            <source src={postPreview} type='video/mp4' />
            Your browser does not support the video format
          </video>
        )}
      </div>
    </>
  );
};

export default PostView;
