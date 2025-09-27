import React, { useState, useEffect } from 'react';
import { CinematicIntroSequence } from './CinematicIntroSequence';

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
    console.log('LoadingStateManager: hasSeenBefore =', hasSeenBefore);
    setHasSeenIntro(hasSeenBefore);
    
    // If they've seen it and we skip on repeat, mark as completed
    if (hasSeenBefore && skipIntroOnRepeat) {
      console.log('LoadingStateManager: Skipping intro (seen before)');
      setIntroCompleted(true);
    } else {
      console.log('LoadingStateManager: Will show intro');
    }
  }, [skipIntroOnRepeat]);

  const handleIntroComplete = () => {
    console.log('LoadingStateManager: Intro completed');
    setIntroCompleted(true);
    setHasSeenIntro(true);
    localStorage.setItem('wzrd-intro-seen', 'true');
  };

  console.log('LoadingStateManager render:', { showIntro, introCompleted, hasSeenIntro, skipIntroOnRepeat });

  // Don't show intro if disabled or already completed
  if (!showIntro || introCompleted) {
    console.log('LoadingStateManager: Showing children (intro disabled or completed)');
    return <>{children}</>;
  }

  // Show intro for new users or when skipIntroOnRepeat is false
  if (!hasSeenIntro || !skipIntroOnRepeat) {
    console.log('LoadingStateManager: Showing intro sequence');
    return (
      <CinematicIntroSequence 
        onComplete={handleIntroComplete}
        canSkip={true}
      />
    );
  }

  // Fallback - should not reach here
  console.log('LoadingStateManager: Fallback - showing children');
  return <>{children}</>;
};