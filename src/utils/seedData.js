**
 * Run this once from the browser console (after login as admin) to seed sample books.
 * import { seedBooks } from './utils/seedData'; seedBooks();
 */
import { addBook } from "../services/bookService";

const SAMPLE_BOOKS = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A story of wealth, love, and the American Dream set in the Roaring Twenties on Long Island.",
    category: "Fiction",
    price: 12.99,
    rating: 4,
    imageUrl: "https://covers.openlibrary.org/b/id/8226197-L.jpg",
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A gripping tale of racial injustice and childhood innocence in the Deep South.",
    category: "Fiction",
    price: 14.99,
    rating: 5,
    imageUrl: "https://covers.openlibrary.org/b/id/8228691-L.jpg",
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description: "Hawking's landmark work explores the nature of space, time, and black holes.",
    category: "Science",
    price: 18.99,
    rating: 5,
    imageUrl: "https://covers.openlibrary.org/b/id/8739161-L.jpg",
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description: "A sweeping exploration of humankind — from Stone Age hunter-gatherers to the present.",
    category: "History",
    price: 16.99,
    rating: 5,
    imageUrl: "https://covers.openlibrary.org/b/id/10375042-L.jpg",
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "A handbook of agile software craftsmanship — principles, patterns, and practices.",
    category: "Technology",
    price: 29.99,
    rating: 4,
    imageUrl: "https://covers.openlibrary.org/b/id/7490038-L.jpg",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description: "A sweeping sci-fi epic about politics, religion, and ecology on a desert planet.",
    category: "Fantasy",
    price: 15.99,
    rating: 5,
    imageUrl: "https://covers.openlibrary.org/b/id/8255691-L.jpg",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A mystical story of Santiago, a shepherd boy who dreams of finding treasure.",
    category: "Fiction",
    price: 11.99,
    rating: 4,
    imageUrl: "https://covers.openlibrary.org/b/id/8297400-L.jpg",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "A practical guide to building good habits and breaking bad ones.",
    category: "Non-Fiction",
    price: 19.99,
    rating: 5,
    imageUrl: "https://covers.openlibrary.org/b/id/10290639-L.jpg",
  },
];

export async function seedBooks() {
  for (const book of SAMPLE_BOOKS) {
    await addBook(book);
    console.log(`Added: ${book.title}`);
  }
  console.log("Seeding complete!");
}
