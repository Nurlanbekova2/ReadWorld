import en from "../i18n/en";
import ru from "../i18n/ru";
import ky from "../i18n/ky";

const CATEGORY_KEYS = {
  all: "all",
  fiction: "fiction",
  "non-fiction": "nonFiction",
  science: "science",
  technology: "technology",
  history: "history",
  biography: "biography",
  fantasy: "fantasy",
  mystery: "mystery",
  romance: "romance",
  comedy: "comedy",
  drama: "drama",
  horror: "horror",
  thriller: "thriller",
  adventure: "adventure",
  psychology: "psychology",
  philosophy: "philosophy",
  poetry: "poetry",
};

const DICTIONARIES = { en, ru, ky };
const KNOWN_BOOK_TITLES = {
  "thus spoke zarathustra": { ru: "Так говорил Заратустра", ky: "Заратустра ушундай деген" },
  meditations: { ru: "Размышления", ky: "Ой жүгүртүүлөр" },
  "the power of now": { ru: "Сила настоящего", ky: "Азыркы учурдун күчү" },
  "thinking, fast and slow": { ru: "Думай медленно… решай быстро", ky: "Тез жана жай ойлон" },
  "around the world in 80 days": { ru: "Вокруг света за 80 дней", ky: "80 күндө дүйнөнү айланып" },
  "treasure island": { ru: "Остров сокровищ", ky: "Казына аралы" },
  "robinson crusoe": { ru: "Робинзон Крузо", ky: "Робинзон Крузо" },
  "the girl with the dragon tattoo": { ru: "Девушка с татуировкой дракона", ky: "Ажыдаар татуировкасы бар кыз" },
  "gone girl": { ru: "Исчезнувшая", ky: "Жоголгон кыз" },
  "the da vinci code": { ru: "Код да Винчи", ky: "Да Винчи коду" },
  dracula: { ru: "Дракула", ky: "Дракула" },
  "the shining": { ru: "Сияние", ky: "Жаркырак" },
  it: { ru: "Оно", ky: "Ал" },
  "the road": { ru: "Дорога", ky: "Жол" },
  "a thousand splendid suns": { ru: "Тысяча сияющих солнц", ky: "Миңдеген жаркыраган күн" },
  "the kite runner": { ru: "Бегущий за ветром", ky: "Шамал кууп жүргөн" },
  "catch-22": { ru: "Уловка-22", ky: "22-тузак" },
  "the hitchhiker guide to the galaxy": { ru: "Автостопом по галактике", ky: "Галактика боюнча автостоп" },
  "good omens": { ru: "Благие знамения", ky: "Жакшы жышаандар" },
  "steve jobs": { ru: "Стив Джобс", ky: "Стив Жобс" },
  "pride and prejudice": { ru: "Гордость и предубеждение", ky: "Сыймык жана бейкалыс" },
  "the lord of the rings": { ru: "Властелин колец", ky: "Шакектердин өкүмдары" },
  "the hobbit": { ru: "Хоббит", ky: "Хоббит" },
  dune: { ru: "Дюна", ky: "Дюна" },
  "clean code": { ru: "Чистый код", ky: "Таза код" },
  sapiens: { ru: "Sapiens: Краткая история человечества", ky: "Sapiens: Адамзаттын кыскача тарыхы" },
  "a brief history of time": { ru: "Краткая история времени", ky: "Убакыттын кыскача тарыхы" },
  "atomic habits": { ru: "Атомные привычки", ky: "Атомдук адаттар" },
  "the alchemist": { ru: "Алхимик", ky: "Алхимик" },
  "the little prince": { ru: "Маленький принц", ky: "Кичинекей ханзаада" },
  "1984": { ru: "1984", ky: "1984" },
  "to kill a mockingbird": { ru: "Убить пересмешника", ky: "Булбулду өлтүрүү" },
  "the great gatsby": { ru: "Великий Гэтсби", ky: "Улуу Гэтсби" },
  "the lion, the witch and the wardrobe": { ru: "Лев, колдунья и платяной шкаф", ky: "Арстан, сыйкырчы жана кийим шкафы" },
  "the jungle book": { ru: "Книга джунглей", ky: "Токой китеби" },
  "alice in wonderland": { ru: "Алиса в Стране чудес", ky: "Алиса кереметтер өлкөсүндө" },
  "peter pan": { ru: "Питер Пэн", ky: "Питер Пэн" },
  "moby-dick": { ru: "Моби Дик", ky: "Моби Дик" },
  "twenty thousand leagues under the sea": { ru: "Двадцать тысяч лье под водой", ky: "Суу астындагы жыйырма миң лье" },
  frankenstein: { ru: "Франкенштейн", ky: "Франкенштейн" },
  "the picture of dorian gray": { ru: "Портрет Дориана Грея", ky: "Дориан Грейдин портрети" },
  "the phantom of the opera": { ru: "Призрак Оперы", ky: "Операдагы элес" },
  "percy jackson": { ru: "Перси Джексон", ky: "Перси Джексон" },
  "the chronicles of narnia": { ru: "Хроники Нарнии", ky: "Нарниянын хроникалары" },
  "sherlock holmes": { ru: "Шерлок Холмс", ky: "Шерлок Холмс" },
  "beauty and the beast": { ru: "Красавица и Чудовище", ky: "Сулуу жана Желмогуз" },
  cinderella: { ru: "Золушка", ky: "Золушка" },
  "the secret garden": { ru: "Таинственный сад", ky: "Жашыруун бак" },
};

function getTranslatedField(book, lang, field) {
  const localized = book.translations?.[lang];
  const translatedField = localized?.[field]
    || book[`${field}_${lang}`]
    || book[`${field}${lang.toUpperCase()}`];
  if (translatedField) return translatedField;
  if (field === "title" && lang !== "en") {
    const knownTranslation = KNOWN_BOOK_TITLES[book.title?.trim().toLocaleLowerCase()]?.[lang];
    if (knownTranslation) return knownTranslation;
  }
  return book[field] || "";
}

function getLocalizedCategory(category, lang, t) {
  if (!category) return "";
  const normalizedCategory = category.trim().toLocaleLowerCase();
  const key = CATEGORY_KEYS[normalizedCategory]
    || Object.entries(CATEGORY_KEYS).find(([, value]) =>
      Object.values(DICTIONARIES).some(
        (dictionary) => dictionary.home.categories[value]?.toLocaleLowerCase() === normalizedCategory
      )
    )?.[1];

  return key ? t.home.categories[key] : category;
}

export function localizeBook(book, lang, t) {
  return {
    title: getTranslatedField(book, lang, "title"),
    author: getTranslatedField(book, lang, "author"),
    description: getTranslatedField(book, lang, "description"),
    category: getLocalizedCategory(book.category, lang, t),
  };
}
