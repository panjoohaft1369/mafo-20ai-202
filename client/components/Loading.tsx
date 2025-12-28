import Lottie from "lottie-react";
import animationData from "/public/animation.json";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  inline?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = "درحال بارگذاری...",
  size = "md",
  inline = false
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  if (inline) {
    return (
      <div className={sizeClasses[size]}>
        <Lottie
          animationData={animationData}
          loop
          autoplay
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={sizeClasses[size]}>
        <Lottie
          animationData={animationData}
          loop
          autoplay
        />
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};
