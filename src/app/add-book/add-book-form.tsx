"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpenIcon } from "lucide-react"
import { CATEGORIES, createBook } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/toast"
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  )
}

function normalizeImageSource(value: string): string | null {
  const source = value.trim()
  if (!source) return null
  if (source.startsWith("/") && !source.startsWith("//")) return source

  try {
    const url = new URL(source)
    return url.protocol === "http:" || url.protocol === "https:" ? source : null
  } catch {
    // While someone is typing, the value may not yet be a complete URL.
    return null
  }
}

export function AddBookForm() {
  const { user, token } = useAuth()
  const formRef = React.useRef<HTMLFormElement>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [preview, setPreview] = React.useState("")
  const [previewFailed, setPreviewFailed] = React.useState(false)

  if (!user || !token) return null

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !user || !token) return

    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const data = Object.fromEntries(form.entries())

    const title = String(data.title ?? "").trim()
    const author = String(data.author ?? "").trim()
    const description = String(data.description ?? "").trim()
    const category = String(data.category ?? CATEGORIES[0])
    const image = String(data.image ?? "").trim()
    const bookNumber = String(data.bookNumber ?? "").trim()
    const totalCopies = Math.max(1, Math.floor(Number(data.totalCopies) || 1))

    if (!title || !author || !description) {
      toast.add({
        type: "error",
        title: "Missing details",
        description: "Title, author and description are all required.",
      })
      return
    }

    setSubmitting(true)
    try {
      const imageSource = normalizeImageSource(image)
      if (!imageSource) {
        toast.add({
          type: "error",
          title: "Valid cover image required",
          description: "Enter an http(s) image URL or a local path such as /covers/cover-teal.svg.",
        })
        return
      }

      await createBook(
        {
          title,
          author,
          category,
          image: imageSource,
          description,
          bookNumber,
          totalCopies,
          availableCopies: totalCopies,
          userName: user.name,
          userEmail: user.email,
          addedAt: new Date().toISOString(),
        },
        token
      )

      toast.add({
        type: "success",
        title: "Book added",
        description: `“${title}” is now on your shelf.`,
      })
      formEl.reset()
      setPreview("")
      setPreviewFailed(false)
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Could not add the book",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const previewSrc = normalizeImageSource(preview)

  return (
    <div className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_12%_18%,_var(--tw-gradient-stops))] from-amber-100/70 via-transparent to-fuchsia-100/60 px-4 py-10 sm:px-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-amber-200 via-orange-100 to-rose-100 px-6 py-6 sm:px-8">
          <CardTitle className="text-xl font-semibold">Add a New Book</CardTitle>
          <CardDescription className="text-foreground/70">
            Fill in the details to share a book with the BookNook community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="book-title">
                Book Title <RequiredMark />
              </Label>
              <Input
                id="book-title"
                name="title"
                type="text"
                required
                autoComplete="off"
                placeholder="e.g. The Midnight Library"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book-number">Book Number</Label>
              <Input
                id="book-number"
                name="bookNumber"
                type="text"
                autoComplete="off"
                placeholder="e.g. ISBN, shelf or inventory number"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book-total-copies">
                Total Copies <RequiredMark />
              </Label>
              <Input
                id="book-total-copies"
                name="totalCopies"
                type="number"
                min={1}
                step={1}
                defaultValue={1}
                required
                autoComplete="off"
                placeholder="How many copies can be borrowed at once?"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="book-author">
                  Author Name <RequiredMark />
                </Label>
                <Input
                  id="book-author"
                  name="author"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Matt Haig"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-category">Category</Label>
                <NativeSelect
                  id="book-category"
                  name="category"
                  className="w-full"
                  defaultValue={CATEGORIES[0]}
                >
                  {CATEGORIES.map((category) => (
                    <NativeSelectOption key={category} value={category}>
                      {category}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book-image">
                Book Image <RequiredMark />
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:size-20">
                  {previewSrc && !previewFailed ? (
                    <Image
                      src={previewSrc}
                      alt="Cover preview"
                      fill
                      sizes="80px"
                      unoptimized
                      className="object-cover"
                      onError={() => setPreviewFailed(true)}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <BookOpenIcon className="size-6" />
                    </span>
                  )}
                </div>
                <Input
                  id="book-image"
                  name="image"
                  type="text"
                  required
                  autoComplete="off"
                  className="min-w-0 flex-1"
                  placeholder="https://example.com/cover.jpg or /covers/cover-teal.svg"
                  onChange={(event) => {
                    setPreview(event.target.value)
                    setPreviewFailed(false)
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="book-description">
                Short Description <RequiredMark />
              </Label>
              <Textarea
                id="book-description"
                name="description"
                required
                rows={4}
                maxLength={2000}
                placeholder="A short summary that helps readers decide what to pick up next."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="book-user-name">User Name</Label>
                <Input
                  id="book-user-name"
                  name="userName"
                  type="text"
                  readOnly
                  defaultValue={user.name}
                  className="text-muted-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-user-email">User Email</Label>
                <Input
                  id="book-user-email"
                  name="userEmail"
                  type="email"
                  readOnly
                  defaultValue={user.email}
                  className="text-muted-foreground"
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Spinner />
                  Adding…
                </>
              ) : (
                "Add Book"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Added a book by mistake?{" "}
            <Link
              href="/my-books"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Manage My Books
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
