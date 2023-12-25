import React, { useState, useEffect } from 'react';
import { LuRectangleHorizontal } from 'react-icons/lu'

const SwitchToDesktopPage = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (windowWidth < 800) {
    return (
      <div style={{ textAlign: 'center', width: "100vw", height: "100vh", display: "flex", alignItems: 'center', justifyContent: 'center', position: 'fixed', zIndex: '9999999', background: '#000000' }}>
        <div>
          <h1>Switch to Desktop View</h1>
          <p style={{fontSize:'60px'}}><LuRectangleHorizontal/></p>
          <p>For a better experience, switch to desktop view and turn mobile into Horizontal view.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default SwitchToDesktopPage;
