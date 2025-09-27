import React, { useEffect, useRef, useState } from 'react';

interface LoginSuccessVideoProps {
  onVideoComplete: () => void;
}

const LoginSuccessVideo: React.FC<LoginSuccessVideoProps> = ({ onVideoComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Handle video loaded
      const handleVideoLoaded = () => {
        setVideoLoaded(true);
        setIsVisible(true);
        // Start playing the video after it's loaded
        video.play().catch(console.error);
      };

      // Handle video end
      const handleVideoEnd = () => {
        // Fade out and then call completion callback
        setIsVisible(false);
        setTimeout(() => {
          onVideoComplete();
        }, 500); // Wait for fade out animation
      };

      // Handle video error
      const handleVideoError = () => {
        console.error('Video failed to load');
        // Skip video and go directly to completion
        setTimeout(() => {
          onVideoComplete();
        }, 1000);
      };

      video.addEventListener('loadeddata', handleVideoLoaded);
      video.addEventListener('ended', handleVideoEnd);
      video.addEventListener('error', handleVideoError);

      // Cleanup
      return () => {
        video.removeEventListener('loadeddata', handleVideoLoaded);
        video.removeEventListener('ended', handleVideoEnd);
        video.removeEventListener('error', handleVideoError);
      };
    }
  }, [onVideoComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
        preload="auto"
      >
        <source src={`${import.meta.env.BASE_URL}CP.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Loading fallback - only show if video hasn't loaded */}
      <div className={`absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-300 ${
        videoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="text-white text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">CouchPotato</h2>
          <p className="text-lg text-gray-300">Preparing your experience...</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccessVideo;
