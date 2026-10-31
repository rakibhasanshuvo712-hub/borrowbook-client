"use client"

import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { useAuth, type User } from "@/lib/auth-context"
import { getInitials } from "@/lib/utils"
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
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <header className="account-banner mb-7">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-fuchsia-800">Your BookNook account</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My Profile</h1>
        <p className="mt-2 text-sm text-foreground/70">Make this reader profile feel like you.</p>
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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Account details</CardTitle>
        <CardDescription>Your BookNook profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={user.photo} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
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
    if (!trimmedName) {
      toast.add({
        type: "error",
        title: "Name required",
        description: "Your profile must have a name.",
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await authClient.updateUser({
        name: trimmedName,
        image: photo.trim() || undefined,
      })
      if (error) {
        toast.add({
          type: "error",
          title: "Could not save profile",
          description: error.message ?? "Something went wrong.",
        })
        return
      }
      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your changes have been saved.",
      })
      onSaved({ name: trimmedName, email: user.email, photo: photo.trim() || undefined })
    } catch (err: unknown) {
      toast.add({
        type: "error",
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Something went wrong.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Edit profile</CardTitle>
        <CardDescription>Update your name and photo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={photo || undefined} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-photo">Photo URL</Label>
            <Input
              id="profile-photo"
              type="url"
              autoComplete="off"
              placeholder="https://…"
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Spinner />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
