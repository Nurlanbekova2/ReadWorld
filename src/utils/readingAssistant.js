import en from "../i18n/en";
import ru from "../i18n/ru";
import ky from "../i18n/ky";
import { localizeBook } from "./localizeBook";

const dictionaries = [en, ru, ky];

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .replace(/ё/g, "е")
    .normalize("NFD")
    .replace(/([\p{Script=Latin}])\p{Diacritic}/gu, "$1")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBookSearchText(book) {
  return [
    book.title,
    book.author,
    book.category,
    book.description,
    ...Object.values(book.translations || {}).flatMap((translation) => [
      translation?.title,
      translation?.author,
      translation?.category,
      translation?.description,
    ]),
    ...Object.entries(book)
      .filter(([key]) => /^(title|author|category|description)(_|[A-Z])/i.test(key))
      .map(([, value]) => value),
  ].filter(Boolean).map(normalize).join(" ");
}

function findCategory(query) {
  for (const key of Object.keys(dictionaries[0].home.categories)) {
    const aliases = dictionaries
      .map((dictionary) => dictionary.home.categories[key])
      .filter(Boolean)
      .map(normalize);
    if (aliases.some((alias) => alias && query.includes(alias))) {
      return { aliases };
    }
  }
  return null;
}

function containsAny(text, phrases) {
  return phrases.some((phrase) => text.includes(phrase));
}

function matchesBookQuery(book, query) {
  const searchableText = getBookSearchText(book);
  const words = query.split(/\s+/).filter((word) =>
    ![
      "a", "an", "and", "book", "can", "find", "for", "i", "im", "is", "looking",
      "me", "please", "search", "the", "to", "what", "you", "how", "much",
      "does", "do", "cost", "price", "of", "is", "it", "tell", "show",
      "сколько", "стоит", "цена", "цену", "книга", "книги", "книге", "книгу",
      "мне", "найди", "найти", "покажи", "подскажи", "пожалуйста", "не",
      "могу", "ищу", "мен", "китеп", "китептин", "баасы", "канча", "таап", "берчи",
    ].includes(word)
  );
  return searchableText.includes(query)
    || (words.length > 0 && words.every((word) => searchableText.includes(word)));
}

function withLocalizedBook(book, lang, t) {
  const localizedBook = localizeBook(book, lang, t);
  return {
    ...book,
    displayTitle: localizedBook.title,
    displayAuthor: localizedBook.author,
  };
}

export function answerReadingAssistant(message, books, lang, t, action) {
  if (action === "find") return { text: t.mascot.assistant.askBook };
  if (action === "reading") {
    return { text: t.mascot.assistant.readingHelp, link: { to: "/reading", label: t.nav.reading } };
  }
  if (action === "genres") {
    return { text: t.mascot.assistant.genresHelp, link: { to: "/books", label: t.nav.browse } };
  }
  if (action === "favorites") {
    return { text: t.mascot.assistant.favoritesHelp, link: { to: "/favorites", label: t.nav.favorites } };
  }
  if (action === "rentals") {
    return { text: t.mascot.assistant.rentalsHelp, link: { to: "/rentals", label: t.nav.rentals } };
  }
  if (action === "recommend") {
    const recommendations = books
      .slice()
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3)
      .map((book) => withLocalizedBook(book, lang, t));
    return recommendations.length
      ? { text: t.mascot.assistant.recommendations, books: recommendations }
      : { text: t.mascot.assistant.noRecommendations };
  }

  const query = normalize(message);
  const category = findCategory(query);
  const categorySearch = Boolean(category);
  const recommendationIntent = containsAny(query, [
    "recommend", "suggest a book", "what should i read", "подбери", "посоветуй", "порекомендуй", "предложи",
    "что почитать", "рекомендац", "сунушта", "эмне окусам", "китеп сунушта",
  ]);
  const notFoundIntent = containsAny(query, [
    "can't find", "cannot find", "not listed", "not in catalog",
    "не могу найти", "не нашел", "не нашла", "не нашёл", "нет книги",
    "таба албай", "табалбай", "жок китеп",
  ]);
  const readingIntent = containsAny(query, [
    "reading list", "reading progress", "track my", "log pages",
    "список чтения", "прогресс чтения", "отметить страницы", "записать страницы",
    "окуу тизмеси", "окуу прогресси", "бет белгиле",
  ]);
  const favoriteIntent = containsAny(query, [
    "favorite", "favourite", "избран", "любим", "тандалма",
  ]);
  const rentalIntent = containsAny(query, [
    "borrow", "rent", "rental", "аренд", "взять книгу", "карызга",
  ]);
  const priceIntent = containsAny(query, [
    "price", "how much", "cost", "сколько", "стоит", "цен", "баасы", "канча",
  ]);
  const matchedBooks = books.filter((book) => {
    if (categorySearch) {
      const bookCategory = normalize(book.category);
      const translatedCategories = dictionaries
        .map((dictionary) => dictionary.home.categories[
          Object.keys(dictionary.home.categories).find((key) =>
            normalize(dictionary.home.categories[key]) === bookCategory
          )
        ])
        .filter(Boolean)
        .map(normalize);
      return category.aliases.includes(bookCategory)
        || translatedCategories.some((label) => category.aliases.includes(label));
    }
    return matchesBookQuery(book, query);
  });
  const localized = (book) => withLocalizedBook(book, lang, t);

  if (recommendationIntent || categorySearch) {
    const recommendations = (categorySearch ? matchedBooks : books)
      .slice()
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3)
      .map(localized);
    return recommendations.length
      ? { text: t.mascot.assistant.recommendations, books: recommendations }
      : { text: t.mascot.assistant.noRecommendations };
  }

  if (matchedBooks.length) {
    if (priceIntent) {
      const book = matchedBooks[0];
      const title = localizeBook(book, lang, t).title;
      const price = Number(book.price);
      const priceText = Number.isFinite(price) && book.price !== "" && book.price != null
        ? price.toLocaleString(lang === "ky" ? "ky-KG" : lang === "ru" ? "ru-RU" : "en-GB")
        : t.mascot.assistant.priceUnavailable;
      return {
        text: t.mascot.assistant.bookPrice
          .replace("{title}", title)
          .replace("{price}", priceText),
        books: [localized(book)],
      };
    }
    return {
      text: t.mascot.assistant.searchResults.replace("{count}", matchedBooks.length),
      books: matchedBooks.slice(0, 5).map(localized),
    };
  }

  if (readingIntent) {
    return { text: t.mascot.assistant.readingHelp, link: { to: "/reading", label: t.nav.reading } };
  }
  if (favoriteIntent) {
    return { text: t.mascot.assistant.favoritesHelp, link: { to: "/favorites", label: t.nav.favorites } };
  }
  if (rentalIntent) {
    return { text: t.mascot.assistant.rentalsHelp, link: { to: "/rentals", label: t.nav.rentals } };
  }
  if (notFoundIntent) {
    return { text: t.mascot.assistant.notFound };
  }
  return { text: t.mascot.assistant.help };
}
