import { useEffect, useRef, useState } from "react";
import EmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  bgColor: string;
  imageUrl?: string;
  imageData?: string;
  order: number;
}

interface DisplaySlideshowProps {
  slidesEndpoint: string; // e.g., "/api/admin/index-slides"
}

export function DisplaySlideshow({ slidesEndpoint }: DisplaySlideshowProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = EmblaCarousel({
    loop: true,
    align: "center",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Load slides from API
  useEffect(() => {
    const loadSlides = async () => {
      try {
        setLoading(true);
        const response = await fetch(slidesEndpoint);
        if (response.ok) {
          const data = await response.json();
          const sortedSlides = (data.slides || []).sort(
            (a: Slide, b: Slide) => a.order - b.order
          );
          setSlides(sortedSlides);
        } else {
          toast.error("خطا در بارگذاری اسلاید‌ها");
        }
      } catch (error) {
        console.error("Error loading slides:", error);
        toast.error("خطا در بارگذاری اسلاید‌ها");
      } finally {
        setLoading(false);
      }
    };

    loadSlides();
  }, [slidesEndpoint]);

  // Handle carousel selection
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

  if (loading) {
    return (
      <div className="w-full h-64 sm:h-80 md:h-96 lg:aspect-[1980/1024] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">درحال بارگذاری اسلاید‌ها...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-64 sm:h-80 md:h-96 lg:aspect-[1980/1024] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">اسلایدی موجود نیست</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:aspect-[1980/1024] group">
      {/* Main Carousel Container - Full Width */}
      <div className="relative w-full h-full overflow-hidden">
        <div ref={emblaRef} className="h-full w-full">
          <div className="flex h-full w-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="relative flex-[0_0_100%] h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50"
              >
                {/* Background Image or Color */}
                {slide.imageData || slide.imageUrl ? (
                  <img
                    src={slide.imageData || slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-r ${slide.bgColor} flex items-center justify-center`}
                  />
                )}

                {/* Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center px-4 mb-2">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="text-sm sm:text-base md:text-lg text-white text-center px-4">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
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
          {slides.map((_, index) => (
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
