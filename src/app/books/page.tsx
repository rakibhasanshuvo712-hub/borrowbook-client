import type { Metadata } from "next"
import { BooksGrid } from "./books-grid"

export const metadata: Metadata = {
  title: "BookNook | All Books",
  description: "Browse every book on the BookNook shelves.",
}

export default function AllBooksPage() {
  return <BooksGrid />
}
