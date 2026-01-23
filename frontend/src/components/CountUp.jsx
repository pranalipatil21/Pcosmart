import React, { useEffect, useState } from 'react';

const CountUp = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function for smooth stop
      const easedProgress = 1 - Math.pow(1 - progress, 3); 
      
      // Extract numeric part if 'end' is a string like "50K"
      const endNum = parseFloat(end.toString().replace(/,/g, '').replace('K', '000'));
      
      setCount(Math.floor(easedProgress * endNum));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  // Format the number back (e.g. 50000 -> 50K) if needed, or just display raw
  const displayCount = () => {
    if (end.toString().includes("K")) {
        return (count / 1000).toFixed(0) + "K";
    }
    return count;
  };

  return <span>{displayCount()}{suffix}</span>;
};

export default CountUp;