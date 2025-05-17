// ImageLoading.js
import React from 'react';
import './ImageLoading.css'; // Import CSS for styling

const ImageLoading = ({isBackground, isCircle}) => {
    return (
        <div
        className="image-loading"
        style={{
            ...(isBackground && { backgroundColor: 'var(--background-color)' }),
            ...(isCircle && { borderRadius: '50%' }),
        }}
        >
        <div className="loading-image"></div>
        </div>

    );
};

export default ImageLoading;
