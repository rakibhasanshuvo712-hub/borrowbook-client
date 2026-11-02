"use client"

import * as React from "react"
import {
  BookOpenTextIcon,
  CameraIcon,
  CheckIcon,
  MailIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useAuth, type User } from "@/lib/auth-context"
import { RequireAuth } from "@/components/require-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function ProfileView() {
  return (
    <RequireAuth>
      <ProfileDetails />
    </RequireAuth>
  )
}

function ProfileDetails() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = React.useState(false)
  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
      <header className="relative isolate mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#193a42] via-[#24565c] to-[#875844] px-5 py-7 text-white shadow-xl shadow-[#193a42]/15 sm:mb-8 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-16 -bottom-36 -z-10 size-80 rounded-full border-[2.5rem] border-white/10 sm:right-8 sm:size-[24rem]" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#f0c991] backdrop-blur">
            <BookOpenTextIcon className="size-3.5" /> YOUR READER PROFILE
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">A little corner of the shelf, just for you.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Keep your reader details up to date so your BookNook account feels like yours.
          </p>
        </div>
      </header>

      {editing ? (
        <EditProfileForm
          user={user}
          onCancel={() => setEditing(false)}
          onSaved={(next) => {
            updateUser(next)
            setEditing(false)
          }}
        />
      ) : (
        <ProfileCard user={user} onEdit={() => setEditing(true)} />
      )}
    </div>
  )
}

function ProfileCard({ user, onEdit }: { user: User; onEdit: () => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
      <Card className="overflow-hidden rounded-3xl border-white/80 bg-card/95 shadow-xl shadow-[#193a42]/[0.07]">
        <div className="h-2 bg-gradient-to-r from-[#1f5960] via-[#bd8960] to-[#d8b77c]" />
        <CardHeader className="flex flex-col gap-5 px-5 pt-6 sm:flex-row sm:items-center sm:px-7 sm:pt-7">
          <div className="relative mx-auto sm:mx-0">
            <div aria-hidden="true" className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#d8b77c] to-[#28666a] opacity-80 blur-[1px]" />
            <Avatar className="relative size-24 border-4 border-card shadow-lg sm:size-28">
              <AvatarImage src={user.photo || undefined} alt={`${user.name}'s profile photo`} />
              <AvatarFallback className="bg-[#244c52] text-2xl font-semibold text-[#f0d49e]">
                <UserRoundIcon aria-hidden="true" className="size-12" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">BookNook reader</p>
            <CardTitle className="mt-1 break-words text-2xl tracking-tight sm:text-3xl">{user.name}</CardTitle>
            <CardDescription className="mt-1 break-all text-sm">{user.email}</CardDescription>
          </div>
          <Button className="w-full shrink-0 gap-2 sm:w-auto" onClick={onEdit}>
            <PencilIcon />
            Edit profile
          </Button>
        </CardHeader>
        <CardContent className="px-5 pb-6 sm:px-7 sm:pb-7">
          <div className="grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-2">
            <ProfileInfo icon={<UserRoundIcon />} label="Display name" value={user.name} />
            <ProfileInfo icon={<MailIcon />} label="Account email" value={user.email} />
          </div>
        </CardContent>
      </Card>

      <aside className="flex flex-col gap-4">
        <Card className="rounded-3xl border-[#d8b77c]/30 bg-gradient-to-br from-[#f4ead4] via-card to-[#e3efeb] shadow-lg shadow-[#193a42]/[0.05]">
          <CardContent className="flex gap-4 p-5 sm:p-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#24565c] text-[#f0d49e] shadow-md shadow-[#193a42]/15">
              <ShieldCheckIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Your account, your details</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Your email identifies your account. You can update your display name and profile photo here.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-white/80 bg-card/80 shadow-lg shadow-[#193a42]/[0.04]">
          <CardContent className="flex items-center gap-4 p-5 sm:p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Profile ready</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Your reader profile is active and ready for your next book.</p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function ProfileInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-muted/55 p-4">
      <span className="mt-0.5 text-primary [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 break-all text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function EditProfileForm({
  user,
  onCancel,
  onSaved,
}: {
  user: User
  onCancel: () => void
  onSaved: (next: User) => void
}) {
  const [name, setName] = React.useState(user.name)
  const [photo, setPhoto] = React.useState(user.photo ?? "")
  const [saving, setSaving] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    const trimmedName = name.trim()
    const trimmedPhoto = photo.trim()
    if (!trimmedName) {
      toast.add({
        type: "error",
        title: "Add your name",
        description: "Enter a display name before saving your profile.",
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await authClient.updateUser({
        name: trimmedName,
        image: trimmedPhoto || undefined,
      })
      if (error) {
        toast.add({
          type: "error",
          title: "Profile not saved",
          description: error.message ?? "Please try again in a moment.",
        })
        return
      }

      onSaved({ name: trimmedName, email: user.email, photo: trimmedPhoto || undefined })
      toast.add({
        type: "success",
        title: "Profile saved",
        description: "Your reader profile has been updated.",
      })
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Profile not saved",
        description: err instanceof Error ? err.message : "Please try again in a moment.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border-white/80 shadow-xl shadow-[#193a42]/[0.07]">
      <div className="h-2 bg-gradient-to-r from-[#1f5960] via-[#bd8960] to-[#d8b77c]" />
      <CardHeader className="px-5 pt-6 sm:px-7 sm:pt-7">
        <CardTitle className="text-xl sm:text-2xl">Edit your reader profile</CardTitle>
        <CardDescription>Choose the name and photo other readers see.</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-6 sm:px-7 sm:pb-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted/45 p-4 sm:flex-row sm:p-5">
            <Avatar className="size-20 border-4 border-card shadow-md">
              <AvatarImage src={photo || undefined} alt={name || "Profile photo preview"} />
              <AvatarFallback className="bg-[#244c52] text-lg font-semibold text-[#f0d49e]">
                <UserRoundIcon aria-hidden="true" className="size-9" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-medium">Profile photo preview</p>
              <p className="mt-1 text-sm text-muted-foreground">Paste a public image URL below, or leave it blank to use your initials.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                type="text"
                required
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="profile-email">Account email</Label>
              <Input id="profile-email" type="email" value={user.email} readOnly className="text-muted-foreground" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-photo">Photo URL</Label>
            <div className="relative">
              <CameraIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="profile-photo"
                type="url"
                autoComplete="url"
                className="pl-9"
                placeholder="https://example.com/your-photo.jpg"
                value={photo}
                onChange={(event) => setPhoto(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="w-full gap-2 sm:w-auto">
              {saving ? <><Spinner /> Saving…</> : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
