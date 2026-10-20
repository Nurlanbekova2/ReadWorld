/**
 * Run this once from the browser console (after login as admin) to seed sample books.
 * import { seedBooks } from './utils/seedData'; seedBooks();
 * The curated book import is also available from the admin dashboard.
 */
import { addBook, getAllBooks, updateBook } from "../services/bookService";

const KYRGYZ_BOOKS = [
  ["Сынган кылыч", "Төлөгөн Касымбеков", "Fiction", "Сломанный меч", "The Broken Sword"],
  ["Поллианна", "Элинор Портер", "Fiction", "Поллианна", "Pollyanna"],
  ["Жамийла", "Чыңгыз Айтматов", "Fiction", "Джамиля", "Jamila"],
  ["Биринчи мугалим", "Чыңгыз Айтматов", "Fiction", "Первый учитель", "The First Teacher"],
  ["Ак кеме", "Чыңгыз Айтматов", "Fiction", "Белый пароход", "The White Ship"],
  ["Гүлсарат", "Чыңгыз Айтматов", "Fiction", "Прощай, Гульсары!", "Farewell, Gulsary!"],
  ["Кылым карытар бир күн", "Чыңгыз Айтматов", "Fiction", "И дольше века длится день", "The Day Lasts More Than a Hundred Years"],
  ["Саманчынын жолу", "Чыңгыз Айтматов", "Fiction", "Материнское поле", "Mother Earth"],
  ["Каныбек", "Касымалы Жантөшев", "Fiction", "Каныбек", "Kanybek"],
  ["Узак жол", "Мукаи Элебаев", "Fiction", "Долгий путь", "The Long Road"],
  ["Келкел", "Төлөгөн Касымбеков", "Fiction", "Келкел", "Kelkel"],
  ["Кызыл жоолук жалжалым", "Чыңгыз Айтматов", "Fiction", "Тополёк мой в красной косынке", "The Red Scarf"],
  ["Эрте келген турналар", "Чыңгыз Айтматов", "Fiction", "Ранние журавли", "The Cranes Fly Early"],
  ["Бетме-бет", "Чыңгыз Айтматов", "Fiction", "Лицом к лицу", "Face to Face"],
  ["Кассандра тамгасы", "Чыңгыз Айтматов", "Fiction", "Тавро Кассандры", "Cassandra's Brand"],
  ["Кичинекей ханзаада", "Антуан де Сент-Экзюпери", "Fiction", "Маленький принц", "The Little Prince"],
  ["Поллианнанын кубанычы", "Элинор Портер", "Fiction", "Радость Поллианны", "Pollyanna Grows Up"],
  ["Энн Грин Гейблстен", "Люси Мод Монтгомери", "Fiction", "Энн из Зелёных крыш", "Anne of Green Gables"],
  ["Кичинекей аялдар", "Луиза Мэй Олкотт", "Fiction", "Маленькие женщины", "Little Women"],
  ["Жашыруун бак", "Фрэнсис Бернетт", "Fiction", "Таинственный сад", "The Secret Garden"],
  ["Сыймык жана бейкалыс", "Джейн Остин", "Romance", "Гордость и предубеждение", "Pride and Prejudice"],
  ["Жейн Эйр", "Шарлотта Бронте", "Romance", "Джейн Эйр", "Jane Eyre"],
  ["Шамалдуу ашуу", "Эмили Бронте", "Romance", "Грозовой перевал", "Wuthering Heights"],
  ["Алиса кереметтер өлкөсүндө", "Льюис Кэрролл", "Fantasy", "Алиса в Стране чудес", "Alice's Adventures in Wonderland"],
  ["Том Сойердин жоруктары", "Марк Твен", "Adventure", "Приключения Тома Сойера", "The Adventures of Tom Sawyer"],
  ["Гекльберри Финндин жоруктары", "Марк Твен", "Adventure", "Приключения Гекльберри Финна", "Adventures of Huckleberry Finn"],
  ["Кенч аралы", "Роберт Льюис Стивенсон", "Adventure", "Остров сокровищ", "Treasure Island"],
  ["Робинзон Крузо", "Даниэль Дефо", "Adventure", "Робинзон Крузо", "Robinson Crusoe"],
  ["Баскервилдердин ити", "Артур Конан Дойл", "Mystery", "Собака Баскервилей", "The Hound of the Baskervilles"],
  ["Монте-Кристо графы", "Александр Дюма", "Adventure", "Граф Монте-Кристо", "The Count of Monte Cristo"],
  ["Үч мушкетёр", "Александр Дюма", "Adventure", "Три мушкетёра", "The Three Musketeers"],
  ["Жүз жылдык жалгыздык", "Габриэль Гарсиа Маркес", "Fiction", "Сто лет одиночества", "One Hundred Years of Solitude"],
  ["Алхимик", "Пауло Коэльо", "Fiction", "Алхимик", "The Alchemist"],
  ["Чал жана деңиз", "Эрнест Хемингуэй", "Fiction", "Старик и море", "The Old Man and the Sea"],
  ["Улуу Гэтсби", "Фрэнсис Скотт Фицджеральд", "Fiction", "Великий Гэтсби", "The Great Gatsby"],
  ["1984", "Джордж Оруэлл", "Fiction", "1984", "Nineteen Eighty-Four"],
  ["Жаныбарлар фермасы", "Джордж Оруэлл", "Fiction", "Скотный двор", "Animal Farm"],
  ["Дракула", "Брэм Стокер", "Horror", "Дракула", "Dracula"],
  ["Франкенштейн", "Мэри Шелли", "Horror", "Франкенштейн", "Frankenstein"],
  ["Дориан Грейдин портрети", "Оскар Уайльд", "Fiction", "Портрет Дориана Грея", "The Picture of Dorian Gray"],
  ["Оз өлкөсүнүн сыйкырчысы", "Лаймен Фрэнк Баум", "Fantasy", "Волшебник страны Оз", "The Wonderful Wizard of Oz"],
  ["Пиноккионун жоруктары", "Карло Коллоди", "Fiction", "Приключения Пиноккио", "The Adventures of Pinocchio"],
  ["Хайди", "Йоханна Спири", "Fiction", "Хайди", "Heidi"],
  ["Ак азуу", "Джек Лондон", "Adventure", "Белый Клык", "White Fang"],
  ["Жапайы чакырык", "Джек Лондон", "Adventure", "Зов предков", "The Call of the Wild"],
  ["Моби Дик", "Герман Мелвилл", "Adventure", "Моби Дик", "Moby-Dick"],
  ["Эки шаардын баяны", "Чарльз Диккенс", "Fiction", "Повесть о двух городах", "A Tale of Two Cities"],
  ["Кылмыш жана жаза", "Фёдор Достоевский", "Fiction", "Преступление и наказание", "Crime and Punishment"],
  ["Согуш жана тынчтык", "Лев Толстой", "Fiction", "Война и мир", "War and Peace"],
  ["Анна Каренина", "Лев Толстой", "Romance", "Анна Каренина", "Anna Karenina"],
];

const LEGACY_KYRGYZ_TITLES = [
  "Жамийла", "Биринчи мугалим", "Ак кеме", "Кылым карытар бир күн", "Гүлсарат",
  "Бетме-бет", "Саманчынын жолу", "Эрте келген турналар", "Кыямат",
  "Деңиз бойлой жорткон ала дөбөт", "Кызыл жоолук жалжалым", "Кассандра тамгасы",
  "Ленин тууралу", "Аял күзгүсү", "Эмгек гүлү", "Атака", "Абалкы ырлар",
  "Днестр терең деңизге куят", "Жараланган жүрөк", "Өз көзүм менен",
  "Менин метрикам", "Тергөө жүрүп жатат", "Комуз күүлөрү", "Токтогул",
  "Чабандар", "Лениндин уулу", "Карачач", "Алып менен Мария", "Байлар жоголсун",
  "Дардаш", "Эки жаш", "Каныбек", "Ким кантти?", "Бир үйдө", "Кең-Суу",
  "Биздин замандын кишилери", "Темир", "Тоолор арасында", "Ыманбай пейили",
  "Өмүр тамыры", "Узак жол", "Манас", "Семетей", "Сейтек", "Эр Төштүк",
  "Кожожаш", "Курманбек", "Жаңыл Мырза", "Олжобай менен Кишимжан", "Кедейкан",
];

function normalizeBookTitle(title) {
  return title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase().trim();
}

export async function seedKyrgyzBooks() {
  const existingBooks = await getAllBooks();
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const legacyTitleIndexes = new Map(
    LEGACY_KYRGYZ_TITLES.map((title, index) => [normalizeBookTitle(title), index])
  );
  const migratedBooks = new Map();
  const regularBooks = [];

  for (const existingBook of existingBooks) {
    const existingTitles = [
      existingBook.title,
      ...Object.values(existingBook.translations || {}).map((translation) => translation?.title),
    ].filter(Boolean).map(normalizeBookTitle);
    const legacyIndex = existingTitles
      .map((title) => legacyTitleIndexes.get(title))
      .find((index) => index !== undefined);

    if (legacyIndex === undefined) regularBooks.push(existingBook);
    else migratedBooks.set(legacyIndex, existingBook);
  }

  const regularTitles = new Set(regularBooks.flatMap((book) => [
    book.title,
    ...Object.values(book.translations || {}).map((translation) => translation?.title),
  ].filter(Boolean).map(normalizeBookTitle)));

  for (const [index, existingBook] of migratedBooks) {
    const replacement = KYRGYZ_BOOKS[index];
    if (!replacement) continue;
    const [title, author, category, russianTitle, englishTitle] = replacement;
    const imageUrl = existingBook.imageUrl?.startsWith("data:image/svg+xml;charset=UTF-8,")
      ? null
      : existingBook.imageUrl || null;

    await updateBook(existingBook.id, {
      title,
      author,
      category,
      price: [300, 250, 450][index % 3],
      imageUrl,
      translations: {
        ru: { title: russianTitle },
        en: { title: englishTitle },
      },
    });
    updated += 1;
  }

  for (let index = 0; index < KYRGYZ_BOOKS.length; index += 1) {
    if (migratedBooks.has(index)) continue;
    const [title, author, category, russianTitle, englishTitle] = KYRGYZ_BOOKS[index];
    const titleVariants = [title, russianTitle, englishTitle].map(normalizeBookTitle);
    if (titleVariants.some((variant) => regularTitles.has(variant))) {
      skipped += 1;
      continue;
    }

    await addBook({
      title,
      author,
      category,
      price: [300, 250, 450][index % 3],
      rating: 0,
      translations: {
        ru: { title: russianTitle },
        en: { title: englishTitle },
      },
    });
    added += 1;
  }

  console.info(`Book list updated: ${updated} replaced, ${added} added, ${skipped} already present.`);
  return { added, updated, skipped };
}

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
