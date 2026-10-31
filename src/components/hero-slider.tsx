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
    bg: "from-emerald-100 via-teal-50 to-sky-100",
    accent: "text-emerald-800",
  },
  {
    eyebrow: "Fresh off the press",
    title: "New arrivals every single week",
    text: "From buzzy debuts to long-awaited sequels, the newest titles land on our shelves first.",
    bg: "from-indigo-100 via-violet-50 to-purple-100",
    accent: "text-indigo-800",
  },
  {
    eyebrow: "Borrow. Read. Return.",
    title: "Your next favourite is one click away",
    text: "Reserve a book in seconds, pick it up at your convenience, and return it whenever you are done.",
    bg: "from-amber-100 via-orange-50 to-rose-100",
    accent: "text-amber-800",
  },
]

type Slide = (typeof slides)[number]

function SlideContent({ slide }: { slide: Slide }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br px-6 py-14 sm:px-12 sm:py-20",
        slide.bg
      )}
    >
      <BookOpenIcon
        aria-hidden="true"
        className={cn(
          "absolute -top-8 -right-6 size-40 rotate-12 opacity-10 sm:size-56",
          slide.accent
        )}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-white/40 blur-2xl"
      />
      <div className="relative max-w-2xl">
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-black/5 bg-background/70 px-3 py-1 text-xs font-medium",
            slide.accent
          )}
        >
          {slide.eyebrow}
        </span>
        <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {slide.title}
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/75 sm:text-base">
          {slide.text}
        </p>
        <Link
          href="/books"
          className={cn(buttonVariants({ size: "lg" }), "mt-7")}
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
      className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6"
    >
      <div className="hero-slider relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="overflow-hidden rounded-2xl ring-1 ring-foreground/10"
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
      className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6"
    >
      <div className="overflow-hidden rounded-2xl ring-1 ring-foreground/10">
        <SlideContent slide={slides[0]} />
      </div>
    </section>
  )
}
