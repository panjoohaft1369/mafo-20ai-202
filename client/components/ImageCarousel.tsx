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
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:aspect-[1980/1024] group">
      {/* Main Carousel Container - Full Width */}
      <div className="relative w-full h-full overflow-hidden">
        <div ref={emblaRef} className="h-full w-full">
          <div className="flex h-full w-full">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative flex-[0_0_100%] h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50"
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
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-xl hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {canScrollNext && (
          <button
            onClick={handleNextClick}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:shadow-xl hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === 0
                  ? "w-8 bg-white"
                  : "w-3 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
