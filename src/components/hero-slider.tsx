"use client"

import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { ArrowRightIcon, BookOpenIcon } from "lucide-react"
import { cn } from "cn"
import { buttonVariants } from "@/components/ui/button"

const slides = [
  {
    eyebrow: "Welcome to BookNook",
    title: "A thousand stories, one quiet shelf",
    text: "Discover, borrow, and share books with a community that reads as eagerly as you do.",
    bg: "from-[#14252e] via-[#203b45] to-[#5c4236]",
    accent: "text-[#e3b67b]",
  },
  {
    eyebrow: "Fresh off the press",
    title: "New arrivals every single week",
    text: "From buzzy debuts to long-awaited sequels, the newest titles land on our shelves first.",
    bg: "from-[#28243a] via-[#48344c] to-[#9b5f5c]",
    accent: "text-[#f0c48f]",
  },
  {
    eyebrow: "Borrow. Read. Return.",
    title: "Your next favourite is one click away",
    text: "Reserve a book in seconds, pick it up at your convenience, and return it whenever you are done.",
    bg: "from-[#163c37] via-[#28665b] to-[#b77c4d]",
    accent: "text-[#f4d6a5]",
  },
]

type Slide = (typeof slides)[number]

function SlideContent({ slide }: { slide: Slide }) {
  return (
    <div
      className={cn(
        "relative min-h-[390px] overflow-hidden bg-gradient-to-br px-6 py-14 text-white sm:min-h-[450px] sm:px-12 sm:py-20 md:px-16",
        slide.bg
      )}
    >
      <BookOpenIcon
        aria-hidden="true"
        className={cn(
          "absolute -top-8 -right-6 size-40 rotate-12 opacity-[0.16] sm:right-10 sm:top-8 sm:size-72",
          slide.accent
        )}
      />
      <div
        aria-hidden="true"
        className="absolute -right-8 -bottom-32 size-80 rounded-full border-[36px] border-white/10 blur-[1px] sm:right-20 sm:size-[28rem]"
      />
      <div className="relative max-w-2xl">
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur",
            slide.accent
          )}
        >
          {slide.eyebrow}
        </span>
        <h2 className="mt-5 max-w-2xl text-4xl leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
          {slide.title}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          {slide.text}
        </p>
        <Link
          href="/books"
          className={cn(buttonVariants({ size: "lg" }), "mt-8 bg-[#e3b67b] text-[#17272b] shadow-lg shadow-black/20 hover:bg-[#f0c991]")}
        >
          Browse Books
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  )
}

export function HeroSlider() {
  return (
    <section
      aria-label="Featured collections"
      className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6"
    >
      <div className="hero-slider relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-35px_rgba(20,37,46,0.62)] ring-1 ring-white/30"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <SlideContent slide={slide} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

/**
 * Static first-slide banner used as the `<Suspense fallback>` for the slider.
 * Swiper reads the clock during render, which prerendering forbids, so the
 * real slider streams in on the client — this keeps the banner looking
 * complete in the prerendered HTML and during hydration.
 */
export function HeroFallback() {
  return (
    <section
      aria-label="Featured collections"
      className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6"
    >
      <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-35px_rgba(20,37,46,0.62)] ring-1 ring-white/30">
        <SlideContent slide={slides[0]} />
      </div>
    </section>
  )
}
