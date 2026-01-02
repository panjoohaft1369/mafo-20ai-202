interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeMap = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-20 w-auto",
  };

  return (
    <video
      autoPlay
      muted
      loop
      className={`${sizeMap[size]} ${className}`}
      style={{ aspectRatio: "auto", objectFit: "contain" }}
    >
      <source
        src="https://cdn.builder.io/o/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fdf8b894ff45f4bd99ed07eed60ddf6ef?alt=media&token=df538dcc-ee68-4a7f-a83b-7dac77e24997&apiKey=4c88dfcd13ad44aba9d3f4537f9785d5"
        type="video/webm"
      />
    </video>
  );
}
