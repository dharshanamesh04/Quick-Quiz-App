let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const questionEl = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const scoreEl = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const progressText = document.getElementById("progressText");

questionEl.innerText = "Loading questions, please wait...";

async function fetchQuestions() {
  try {
    const res = await fetch(
      'https://opentdb.com/api.php?amount=10&category=9&type=multiple'
    );
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("No questions returned from API");
    }

    return data.results.map(q => {
      const answers = [...q.incorrect_answers, q.correct_answer];
      answers.sort(() => Math.random() - 0.5);
      return {
        question: decodeHTML(q.question),
        choices: answers.map(decodeHTML),
        correctAnswer: decodeHTML(q.correct_answer)
      };
    });

  } catch (error) {
    console.error("Error fetching questions:", error);
    questionEl.innerText = "Failed to load questions. Please try again after checking your internet connection.";
    return [];
  }
}

function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

async function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  scoreEl.innerText = score;

  questions = await fetchQuestions();

  if (questions.length === 0) return; // stop if failed

  showQuestion();
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    localStorage.setItem("mostRecentScore", score);
    return window.location.assign("end.html");
  }

  const currentQuestion = questions[currentQuestionIndex];
  questionEl.innerText = currentQuestion.question;
  progressText.innerText = `Question ${currentQuestionIndex + 1}/${questions.length}`;
  progressBarFull.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;

  choices.forEach((choiceEl, index) => {
    choiceEl.innerText = currentQuestion.choices[index];
    choiceEl.classList.remove("correct", "incorrect");
  });
}

choices.forEach(choice => {
  choice.addEventListener("click", e => {
    const selectedAnswer = e.target.innerText;
    const currentQuestion = questions[currentQuestionIndex];

    if (selectedAnswer === currentQuestion.correctAnswer) {
      e.target.classList.add("correct");
      score++;
      scoreEl.innerText = score;
    } else {
      e.target.classList.add("incorrect");
      const correctIndex = currentQuestion.choices.indexOf(currentQuestion.correctAnswer);
      choices[correctIndex].classList.add("correct");
    }

    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion();
    }, 1000);
  });
});

startGame();
