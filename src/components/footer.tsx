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
    <footer className="border-t border-teal-900/20 bg-teal-800 text-teal-50">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
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
                      className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-teal-50 transition-colors hover:bg-white/20 hover:text-white"
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
