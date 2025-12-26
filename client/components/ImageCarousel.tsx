import { useEffect, useRef, useState } from "react";
import EmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images?: string[];
}

export function ImageCarousel({ images = [
  "/images/samples/sample-1.jpg",
  "/images/samples/sample-2.jpg",
  "/images/samples/sample-3.jpg",
] }: ImageCarouselProps) {
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

  const handlePrevClick = () => {
    emblaApi?.scrollPrev();
  };

  const handleNextClick = () => {
    emblaApi?.scrollNext();
  };

  return (
    <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden group">
      {/* Carousel Container */}
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] h-full flex items-center justify-center bg-background"
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Fallback for missing images
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {canScrollPrev && (
        <button
          onClick={handlePrevClick}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {canScrollNext && (
        <button
          onClick={handleNextClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === 0 ? "w-6 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
