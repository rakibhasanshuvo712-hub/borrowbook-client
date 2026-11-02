import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

import { Suspense } from "react"
import {
  BookMarkedIcon,
  CalendarCheckIcon,
  QuoteIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { HeroSlider, HeroFallback } from "@/components/hero-slider"
import { NewArrivals } from "@/components/new-arrivals"
import { SectionHeading } from "@/components/section-heading"

const steps = [
  {
    icon: SearchIcon,
    title: "Browse the shelves",
    text: "Explore a growing collection across every genre, mood, and reading level.",
  },
  {
    icon: BookMarkedIcon,
    title: "Reserve in a tap",
    text: "Found your pick? Reserve it instantly and we will hold it just for you.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Pick it up",
    text: "Collect from your nearest hub or have it dropped at your door.",
  },
  {
    icon: RotateCcwIcon,
    title: "Return when done",
    text: "Finished the last page? Send it back anytime — no late fees, ever.",
  },
]

const reviews = [
  {
    quote:
      "BookNook turned my monthly library run into a two-tap errand. There is always something great queued up on my shelf.",
    name: "Maya Thompson",
    role: "Member since 2023",
    initials: "MT",
  },
  {
    quote:
      "The selection is genuinely thoughtful, and returning a book takes seconds. Our whole book club made the switch.",
    name: "Daniel Okafor",
    role: "Book club host",
    initials: "DO",
  },
  {
    quote:
      "I discovered three new favourite authors here this year. The new arrivals shelf never misses.",
    name: "Priya Raman",
    role: "Avid reader",
    initials: "PR",
  },
]

const stepTones = [
  "bg-amber-200 text-amber-950",
  "bg-teal-200 text-teal-950",
  "bg-[#edcfaa] text-[#563c2b]",
  "bg-orange-200 text-orange-950",
]

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-transparent">
      <h1 className="sr-only">
        BookNook — discover, borrow, and share books
      </h1>

      {/* Swiper reads the clock during render, which prerendering forbids:
          the banner streams in behind Suspense, with a static copy of the
          first slide as the fallback. */}
      <Suspense fallback={<HeroFallback />}>
        <HeroSlider />
      </Suspense>

      <NewArrivals />

      <section aria-labelledby="how-it-works-heading" className="shelf-panel">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            id="how-it-works-heading"
            title="How Borrowing Works"
            subtitle="From first click to final page — four simple steps."
          />
          <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <li
                  key={step.title}
                  className="step-card h-full rounded-2xl bg-background/80 p-6 shadow-md shadow-teal-950/[0.04] ring-1 ring-white/70 transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex size-11 items-center justify-center rounded-2xl shadow-sm ${stepTones[index]}`}>
                      <Icon className="size-5" />
                    </span>
                    <span className="rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold text-foreground/65 ring-1 ring-foreground/5">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section aria-labelledby="reviews-heading">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            id="reviews-heading"
            title="Reader Reviews"
            subtitle="What our members say about life at BookNook."
          />
          <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {reviews.map((review, index) => (
              <li
                key={review.name}
                className="reader-card flex h-full flex-col rounded-2xl bg-card p-6 ring-1 ring-white/70"
              >
                <QuoteIcon className={`size-5 ${["text-[#9a6a38]", "text-[#28666a]", "text-[#9b5e48]"][index]}`} />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                  {review.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{review.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{review.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.role}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
