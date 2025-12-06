// src/components/Loader.jsx
import React from 'react';
import './Loader.css';

function Loader() {
  return (
    <div className="shivba-loader-overlay">
      <div className="shivba-loader-blend">
        <div className="shivba-loader-glow-ring"></div>
        <div className="shivba-cube">
          <div className="face front">SHIVBA</div>
          <div className="face back">TALIM</div>
          <div className="face right">GYM</div>
          <div className="face left">LIB</div>
          <div className="face top">HOSTEL</div>
          <div className="face bottom">SOCIAL</div>
        </div>
        <div className="shivba-loader-text">Loading...</div>
      </div>
    </div>
  );
}

export default Loader;
