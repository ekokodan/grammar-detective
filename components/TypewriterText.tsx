import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 10, className = '', onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isSkipped, setIsSkipped] = useState(false);

  // Safety check: Ensure text is defined
  const safeText = text || '';

  useEffect(() => {
    setDisplayedText('');
    setIsSkipped(false);
  }, [safeText]);

  useEffect(() => {
    if (!safeText) {
      if (onComplete) onComplete();
      return;
    }

    if (isSkipped) {
      setDisplayedText(safeText);
      if (onComplete) onComplete();
      return;
    }

    let i = 0;
    const intervalId = setInterval(() => {
      if (i < safeText.length) {
        setDisplayedText(safeText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [safeText, speed, isSkipped, onComplete]);

  return (
    <div 
      className={`${className} cursor-pointer`} 
      onClick={() => setIsSkipped(true)}
      title="Click to skip typing"
    >
      <span>{displayedText}</span>
      {!isSkipped && displayedText.length < safeText.length && (
        <span className="inline-block w-2 h-5 bg-amber-600 ml-1 align-middle animate-pulse"></span>
      )}
    </div>
  );
};