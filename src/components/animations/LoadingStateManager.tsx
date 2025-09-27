import React, { useState, useEffect } from 'react';
import { IntroSequence } from './IntroSequence';

interface LoadingStateManagerProps {
  children: React.ReactNode;
  showIntro?: boolean;
  skipIntroOnRepeat?: boolean;
}

export const LoadingStateManager: React.FC<LoadingStateManagerProps> = ({
  children,
  showIntro = true,
  skipIntroOnRepeat = true,
}) => {
  const [introCompleted, setIntroCompleted] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  useEffect(() => {
    // Check if user has seen intro before (localStorage)
    const hasSeenBefore = localStorage.getItem('wzrd-intro-seen') === 'true';
    setHasSeenIntro(hasSeenBefore);
    
    // If they've seen it and we skip on repeat, mark as completed
    if (hasSeenBefore && skipIntroOnRepeat) {
      setIntroCompleted(true);
    }
  }, [skipIntroOnRepeat]);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    setHasSeenIntro(true);
    localStorage.setItem('wzrd-intro-seen', 'true');
  };

  // Don't show intro if disabled or already completed
  if (!showIntro || introCompleted) {
    return <>{children}</>;
  }

  // Show intro for new users or when skipIntroOnRepeat is false
  if (!hasSeenIntro || !skipIntroOnRepeat) {
    return (
      <IntroSequence 
        onComplete={handleIntroComplete}
        canSkip={true}
      />
    );
  }

  // Fallback - should not reach here
  return <>{children}</>;
};