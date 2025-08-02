import { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  style?: React.CSSProperties;
}

export const LottieAnimation = ({
  animationData,
  loop = true,
  autoplay = true,
  speed = 1,
  className = "",
  onComplete,
  style = {}
}: LottieAnimationProps) => {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  return (
    <div className={className} style={style}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

// Predefined animation components
export const SuccessAnimation = ({ className = "", onComplete }: { className?: string; onComplete?: () => void }) => {
  // This would use a success checkmark animation
  const successData = {
    // Placeholder for success animation data
    // In a real implementation, you'd import a JSON file
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm: "Success",
    ddd: 0,
    assets: [],
    layers: []
  };

  return (
    <LottieAnimation
      animationData={successData}
      loop={false}
      autoplay={true}
      className={className}
      onComplete={onComplete}
    />
  );
};

export const LoadingAnimation = ({ className = "" }: { className?: string }) => {
  // This would use a loading spinner animation
  const loadingData = {
    // Placeholder for loading animation data
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm: "Loading",
    ddd: 0,
    assets: [],
    layers: []
  };

  return (
    <LottieAnimation
      animationData={loadingData}
      loop={true}
      autoplay={true}
      className={className}
    />
  );
};

export const EmptyStateAnimation = ({ className = "" }: { className?: string }) => {
  // This would use an empty state illustration
  const emptyData = {
    // Placeholder for empty state animation data
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm: "Empty State",
    ddd: 0,
    assets: [],
    layers: []
  };

  return (
    <LottieAnimation
      animationData={emptyData}
      loop={true}
      autoplay={true}
      className={className}
    />
  );
};

export const TransitionAnimation = ({ 
  className = "", 
  onComplete 
}: { 
  className?: string; 
  onComplete?: () => void 
}) => {
  // This would use a page transition animation
  const transitionData = {
    // Placeholder for transition animation data
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm: "Transition",
    ddd: 0,
    assets: [],
    layers: []
  };

  return (
    <LottieAnimation
      animationData={transitionData}
      loop={false}
      autoplay={true}
      className={className}
      onComplete={onComplete}
    />
  );
};

export default LottieAnimation; 