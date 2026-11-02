import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"
import { Logo } from "@/components/logo"
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/brand-icons"

const socials = [
  { label: "X", href: "#", Icon: XIcon },
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
  { label: "YouTube", href: "#", Icon: YouTubeIcon },
]

const contact = [
  { icon: MailIcon, label: "hello@booknook.com", href: "mailto:hello@booknook.com" },
  { icon: PhoneIcon, label: "+1 (555) 012-3456", href: "tel:+15550123456" },
  { icon: MapPinIcon, label: "42 Reading Road, Storyville", href: undefined },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#d8b77c]/25 bg-gradient-to-br from-[#142d34] via-[#1f4b50] to-[#503c35] text-teal-50">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-8 size-72 rounded-full border-[1.5rem] border-white/[0.035]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-20 size-80 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div className="space-y-4">
          <Logo className="text-white" />
          <p className="max-w-sm text-sm text-teal-100/80">
            BookNook is a cozy corner of the internet where readers discover,
            borrow, and share books with their community.
          </p>
          <div>
            <p className="mb-2 text-sm font-medium">Follow us</p>
            <ul className="flex flex-wrap gap-2">
              {socials.map((social) => {
                const Icon = social.Icon
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-teal-50 transition-all hover:-translate-y-0.5 hover:border-amber-200/60 hover:bg-amber-200/15 hover:text-amber-100"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="space-y-4 md:justify-self-end">
          <p className="text-sm font-medium">Contact us</p>
          <ul className="space-y-2 text-sm text-teal-100/80">
            {contact.map((item) => {
              const Icon = item.icon
              const content = (
                <>
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </>
              )
              return (
                <li key={item.label} className="flex items-center gap-2">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="transition-colors hover:text-white"
                    >
                      {content}
                    </a>
                  ) : (
                    <span className="flex items-center gap-2">{content}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-sm text-teal-100/70 sm:px-6">
          © 2026 BookNook. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
