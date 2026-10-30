"use client"

import { useAuth } from "@/lib/auth-context"
import { getInitials } from "@/lib/utils"
import { RequireAuth } from "@/components/require-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileDetails />
    </RequireAuth>
  )
}

function ProfileDetails() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
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
            <div>
              <p className="text-base font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
