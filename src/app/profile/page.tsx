import type { Metadata } from "next"
import { ProfileView } from "./profile-view"

export const metadata: Metadata = {
  title: "BookNook | My Profile",
  description: "Your BookNook account details.",
}

export default function ProfilePage() {
  return <ProfileView />
}
