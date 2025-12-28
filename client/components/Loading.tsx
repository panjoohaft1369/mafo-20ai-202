import Lottie from "lottie-react";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export const Loading: React.FC<LoadingProps> = ({ 
  text = "درحال بارگذاری...", 
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={sizeClasses[size]}>
        <Lottie
          animationData={require("/public/animation.json")}
          loop
          autoplay
        />
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};
