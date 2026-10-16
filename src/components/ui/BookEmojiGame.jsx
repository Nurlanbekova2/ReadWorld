import { useState } from "react";
import { FiAward, FiBookOpen, FiPlay, FiRefreshCw, FiStar, FiZap } from "react-icons/fi";
import { useLang } from "../../i18n/index.jsx";

const QUESTIONS = [
  { emoji: "🧙‍♂️💍🌋", answer: "lordOfTheRings", choices: ["theHobbit", "lordOfTheRings", "harryPotter", "littlePrince"] },
  { emoji: "🦁👑🧙‍♀️❄️", answer: "lionWitchWardrobe", choices: ["jungleBook", "lionWitchWardrobe", "aliceWonderland", "peterPan"] },
  { emoji: "✨🌹🦊🪐", answer: "littlePrince", choices: ["littlePrince", "alchemist", "theHobbit", "mobyDick"] },
  { emoji: "🐋⛵⚓", answer: "mobyDick", choices: ["treasureIsland", "robinsonCrusoe", "mobyDick", "twentyThousandLeagues"] },
  { emoji: "🧛‍♂️🦇🏰", answer: "dracula", choices: ["frankenstein", "dracula", "dorianGray", "phantomOpera"] },
  { emoji: "🧒⚡🪄🏰", answer: "harryPotter", choices: ["percyJackson", "theHobbit", "harryPotter", "chroniclesNarnia"] },
  { emoji: "🕵️‍♀️🔎🏚️", answer: "sherlockHolmes", choices: ["sherlockHolmes", "dracula", "mobyDick", "littlePrince"] },
  { emoji: "🌹🕰️🫖🏰", answer: "beautyBeast", choices: ["cinderella", "beautyBeast", "secretGarden", "aliceWonderland"] },
  { emoji: "💌💃🏰🧐", answer: "pridePrejudice", choices: ["janeEyre", "pridePrejudice", "annaKarenina", "cinderella"] },
  { emoji: "🎷🥂💚🏙️", answer: "greatGatsby", choices: ["greatGatsby", "dorianGray", "crimePunishment", "pridePrejudice"] },
  { emoji: "🪓🩸🧠⚖️", answer: "crimePunishment", choices: ["dracula", "crimePunishment", "greatGatsby", "metamorphosis"] },
  { emoji: "🧔‍♂️⛵🌊🧜‍♀️", answer: "odyssey", choices: ["mobyDick", "odyssey", "twentyThousandLeagues", "robinsonCrusoe"] },
  { emoji: "🪵👃🦗🎭", answer: "pinocchio", choices: ["peterPan", "pinocchio", "tomSawyer", "wizardOz"] },
  { emoji: "🌪️👠🦁🛤️", answer: "wizardOz", choices: ["wizardOz", "lionWitchWardrobe", "aliceWonderland", "pinocchio"] },
  { emoji: "👦🎨⛵🏞️", answer: "tomSawyer", choices: ["tomSawyer", "peterPan", "treasureIsland", "percyJackson"] },
  { emoji: "🏰🔒💰⚔️", answer: "monteCristo", choices: ["monteCristo", "treasureIsland", "robinsonCrusoe", "dorianGray"] },
  { emoji: "🌍🚂🕰️", answer: "aroundWorld80", choices: ["twentyThousandLeagues", "aroundWorld80", "odyssey", "treasureIsland"] },
  { emoji: "⚔️🇷🇺🕊️📖", answer: "warPeace", choices: ["crimePunishment", "warPeace", "annaKarenina", "greatGatsby"] },
  { emoji: "🚂❤️💔🏛️", answer: "annaKarenina", choices: ["janeEyre", "pridePrejudice", "annaKarenina", "warPeace"] },
  { emoji: "🪲🛏️🚪👨‍👩‍👦", answer: "metamorphosis", choices: ["frankenstein", "metamorphosis", "crimePunishment", "dorianGray"] },
  { emoji: "👩📚🔥🏰", answer: "janeEyre", choices: ["janeEyre", "pridePrejudice", "secretGarden", "beautyBeast"] },
  { emoji: "🤺🐴🛡️🌬️", answer: "donQuixote", choices: ["donQuixote", "theHobbit", "robinsonCrusoe", "monteCristo"] },
  { emoji: "🇫🇷⚖️🧵🗡️", answer: "taleTwoCities", choices: ["chroniclesNarnia", "taleTwoCities", "monteCristo", "warPeace"] },
  { emoji: "🐕❄️🌲🐾", answer: "callWild", choices: ["jungleBook", "callWild", "mobyDick", "theHobbit"] },
  { emoji: "👤🕶️🏙️💡", answer: "invisibleMan", choices: ["invisibleMan", "greatGatsby", "dorianGray", "sherlockHolmes"] },
  { emoji: "🌧️🏘️🧬⏳", answer: "oneHundredYears", choices: ["oneHundredYears", "warPeace", "secretGarden", "alchemist"] },
];

const BEST_SCORE_KEY = "readworld-book-emoji-game-best";
const QUESTIONS_PER_GAME = 5;

function pickQuestions() {
  const shuffled = [...QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, QUESTIONS_PER_GAME);
}

export default function BookEmojiGame() {
  const { t } = useLang();
  const copy = t.readingGame;
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [bestScore, setBestScore] = useState(
    () => Number(localStorage.getItem(BEST_SCORE_KEY) || 0)
  );

  function startGame() {
    setQuestions(pickQuestions());
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setCompleted(false);
  }

  function finishGame() {
    setCompleted(true);
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem(BEST_SCORE_KEY, String(score));
    }
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      finishGame();
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelected(null);
  }

  const question = questions[questionIndex];
  const isPlaying = questions.length > 0 && !completed;
  const feedback = score === QUESTIONS_PER_GAME
    ? copy.perfect
    : score >= 3
      ? copy.great
      : copy.encouragement;
  const books = copy.books;

  return (
    <section className="overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-dark-surface shadow-sm">
      <div className="bg-gradient-to-r from-purple-600 to-primary-600 px-5 py-5 text-white sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-purple-100">{copy.eyebrow}</p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-bold sm:text-2xl"><FiBookOpen aria-hidden="true" /> {copy.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-white/80">{copy.description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold">
            <FiAward aria-hidden="true" />
            <span>{copy.best}: {bestScore}/{QUESTIONS_PER_GAME}</span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {!isPlaying && !completed && (
          <div className="text-center">
            <p className="mb-4 text-sm text-gray-500 dark:text-dark-muted">{copy.invitation}</p>
            <button onClick={startGame} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
              <FiPlay aria-hidden="true" /> {copy.start}
            </button>
          </div>
        )}

        {isPlaying && question && (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm font-medium text-gray-500 dark:text-dark-muted">
              <span>{copy.question} {questionIndex + 1}/{questions.length}</span>
              <span>{copy.score}: {score}</span>
            </div>
            <div className="mb-5 rounded-2xl bg-purple-50 py-7 text-center text-5xl tracking-widest dark:bg-purple-900/20 sm:text-6xl" aria-label={copy.emojiHint}>
              {question.emoji}
            </div>
            <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-dark-text">{copy.choose}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {question.choices.map((choice) => {
                const isAnswer = choice === question.answer;
                const isSelected = selected === choice;
                const resultStyle = selected === null
                  ? "border-gray-200 dark:border-dark-border hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  : isAnswer
                    ? "border-green-400 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200"
                    : isSelected
                      ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
                      : "border-gray-100 opacity-60 dark:border-dark-border";
                return (
                  <button
                    key={choice}
                    onClick={() => {
                      if (selected !== null) return;
                      setSelected(choice);
                      if (isAnswer) setScore((current) => current + 1);
                    }}
                    disabled={selected !== null}
                    className={"rounded-xl border px-4 py-3 text-left text-sm font-medium transition " + resultStyle}
                  >
                    {books[choice]}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className={"text-sm font-semibold " + (selected === question.answer ? "text-green-600 dark:text-green-300" : "text-amber-600 dark:text-amber-300")}>
                  {selected === question.answer ? copy.correct : `${copy.answer}: ${books[question.answer]}`}
                </p>
                <button onClick={nextQuestion} className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
                  {questionIndex === questions.length - 1 ? copy.seeResult : copy.next}
                </button>
              </div>
            )}
          </div>
        )}

        {completed && (
          <div className="text-center">
            {score === QUESTIONS_PER_GAME
              ? <FiAward className="mx-auto mb-2 text-yellow-500" size={36} aria-hidden="true" />
              : score >= 3
                ? <FiStar className="mx-auto mb-2 text-yellow-500" size={36} aria-hidden="true" />
                : <FiZap className="mx-auto mb-2 text-primary-500" size={36} aria-hidden="true" />}
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text">{copy.finished}: {score}/{QUESTIONS_PER_GAME}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-muted">{feedback}</p>
            <button onClick={startGame} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
              <FiRefreshCw aria-hidden="true" /> {copy.playAgain}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
