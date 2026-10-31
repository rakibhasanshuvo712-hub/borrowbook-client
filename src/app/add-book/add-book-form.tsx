"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpenIcon } from "lucide-react"
import { canUploadImages, CATEGORIES, createBook, uploadImage } from "@/lib/api"
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

export function AddBookForm() {
  const { user, token } = useAuth()
  const formRef = React.useRef<HTMLFormElement>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [preview, setPreview] = React.useState("")
  const [previewFailed, setPreviewFailed] = React.useState(false)
  const warnedMissingUploads = React.useRef(false)

  // No imgbb key → cover uploads are off; say so once, then fall back to a URL.
  React.useEffect(() => {
    if (canUploadImages() || warnedMissingUploads.current) return
    warnedMissingUploads.current = true
    toast.add({
      type: "warning",
      title: "Cover uploads are disabled",
      description:
        "NEXT_PUBLIC_IMGBB_API_KEY is not set, so paste an image URL for the cover instead.",
    })
  }, [])

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
    let image = String(data.image ?? "").trim()

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
      const file = form.get("imageFile")
      if (file instanceof File && file.size > 0) {
        toast.add({
          type: "loading",
          title: "Uploading cover…",
          description: "Sending the image to imgbb.",
        })
        image = await uploadImage(file)
      }

      if (!image) {
        toast.add({
          type: "error",
          title: "Cover image required",
          description: "Upload a cover or paste an image URL first.",
        })
        return
      }

      await createBook(
        {
          title,
          author,
          category,
          image,
          description,
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

  const uploads = canUploadImages()
  const previewSrc = preview.trim()
  const showPreview = previewSrc !== "" && !previewFailed

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Add a New Book</CardTitle>
          <CardDescription>
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
              {uploads ? (
                <Input
                  id="book-image"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  required
                  className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:size-20">
                    {showPreview ? (
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
                    type="url"
                    required
                    autoComplete="off"
                    className="min-w-0 flex-1"
                    placeholder="https://… or /covers/my-book.svg"
                    onChange={(event) => {
                      setPreview(event.target.value)
                      setPreviewFailed(false)
                    }}
                  />
                </div>
              )}
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
