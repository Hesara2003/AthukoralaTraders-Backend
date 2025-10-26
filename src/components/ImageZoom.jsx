import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ImageZoom = ({ src, alt, className = '' }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200"
        animate={{
          scale: isZoomed ? 2 : 1,
        }}
        style={{
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
      />
      
      {isZoomed && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-32 h-32 border-2 border-white rounded-full opacity-50"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageZoom;
