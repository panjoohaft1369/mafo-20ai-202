import { useEffect, useRef, useState } from "react";
import EmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images?: string[];
}

export function ImageCarousel({
  images = [
    "/images/samples/sample-1.jpg",
    "/images/samples/sample-2.jpg",
    "/images/samples/sample-3.jpg",
  ],
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = EmblaCarousel({
    loop: true,
    align: "center",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = () => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  };

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  const handlePrevClick = () => {
    emblaApi?.scrollPrev();
  };

  const handleNextClick = () => {
    emblaApi?.scrollNext();
  };

  return (
    <div className="relative w-full group">
      {/* Main Carousel Container with Shadow & Rounded */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <div ref={emblaRef} className="h-96 sm:h-[500px]">
          <div className="flex h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative flex-[0_0_100%] h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50"
              >
                <img
                  src={image}
                  alt={`Generated Sample ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for missing images
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gradient Overlay for Navigation Buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Navigation Buttons */}
        {canScrollPrev && (
          <button
            onClick={handlePrevClick}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-xl hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {canScrollNext && (
          <button
            onClick={handleNextClick}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-xl hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Slide Indicators */}
      <div className="flex gap-2 justify-center mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === 0
                ? "w-8 bg-primary"
                : "w-3 bg-muted hover:bg-muted/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>

      {/* Sample Count */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">نمونه‌های زنده</span> از قابلیت‌های MAFO
        </p>
      </div>
    </div>
  );
}
