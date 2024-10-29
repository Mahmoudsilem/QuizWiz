// "use strict"

const category = document.getElementById("categoryMenu");
const difficulty = document.getElementById("difficultyOptions");
const questionsNumber = document.getElementById("questionsNumber");

const rowData = document.getElementById("rowData")
const startForm = document.getElementById("quizOptions")

const btnStartQuiz = document.getElementById("startQuiz");

let questions;
let currentQuiz;

class quiz {
  constructor({ category, difficulty, questionsNumber }) {
    this.category = category;
    this.difficulty = difficulty;
    this.questionsNumber = questionsNumber;
    this.score = 0
  }
  generateAPI() {
    return `https://opentdb.com/api.php?amount=${this.questionsNumber}&category=${this.category}&difficulty=${this.difficulty}`;
  }
  async callAPI() {
    try {
      const response = await fetch(this.generateAPI());
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.log(error);
    }
  }
  //displaying final score
  displayResult() {
    const container =
      `
        <div class="question shadow-lg col-lg-12  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3">
        <h2 class="mb-0 text-center">
          ${this.score == this.questionsNumber ? 'Will done you got full score ${this.score} of ${this.questionsNumber}' : `your score is ${this.score} of ${this.questionsNumber}`}
        </h2>
        <button id="againBtn" class="again btn btn-primary rounded-pill"><i class="bi bi-arrow-repeat"></i> Try Again</button>
        </div>
      `
    rowData.innerHTML = container;
    const againBtn = document.getElementById("againBtn");
    againBtn.addEventListener("click", () => {
      rowData.innerHTML = "";
      startForm.classList.remove("d-none");
      startForm.classList.add("d-flex");
    })
  }
}

// class for current question and it's answers current 
class current {
  constructor(index) {
    this.index = index;
    this.category = questions[this.index].category;
    this.question = questions[this.index].question;
    this.correctAnswer = questions[this.index].correct_answer;
    this.incorrectAnswers = questions[this.index].incorrect_answers;
    this.allAnswers = this.shuffleAnswers([this.correctAnswer, ...this.incorrectAnswers]);
    this.isAnswered = true;
  }
  // simple array shuffle
  shuffleAnswers(arr){
    return arr.sort(()=>Math.random() - 0.5);
  }
  // display questin by it's index in the qustions array
  display() {
    const container =
      `
      <div
        class="question shadow-lg col-md-8 offset-md-2  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3 animate__animated animate__bounceIn">
        <div class="w-100 d-flex justify-content-between">
          <span class="btn btn-category">${this.category}</span>
          <span class="fs-6 btn btn-questions"> ${this.index + 1} of ${questions.length} Questions</span>
        </div>
        <h2 class="text-capitalize h4 text-center">${this.question}</h2>
        <ul class="choices w-100 list-unstyled m-0 d-flex flex-wrap text-center">
          ${this.allAnswers.map((value) => `<li class="answer-item">${value}</li>`).join("")}
        </ul>
        <h2 class="text-capitalize text-center score-color h3 fw-bold"><i class="bi bi-emoji-laughing"></i> Score: ${currentQuiz.score}</h2>
      </div>
    `;
    rowData.innerHTML = container

    const allLi = document.querySelectorAll("ul li.answer-item");
    allLi.forEach((answer) => {
      answer.addEventListener("click", () => {
        this.checkAnswer(answer);
      })

    })
  }
  checkAnswer(answer) {
    if (this.isAnswered) {
      this.isAnswered = false;
      if (answer.innerHTML == this.correctAnswer) {
        answer.classList.add("correct", "animate__animated", "animate__pulse");
        currentQuiz.score++;
      } else {
        answer.classList.add("wrong", "animate__animated", "animate__shakeX");
        const allLi = document.querySelectorAll("ul li.answer-item")
        allLi.forEach((answer) => {
          if (answer.innerHTML == this.correctAnswer) {
            setTimeout(() => { answer.classList.add("correct", "animate__animated", "animate__pulse") }, 300)

          }
        })
      }
    }
    setTimeout(() => { this.nextQuestion() }, 1500)
  }
  nextQuestion() {
    this.index++;
    if (this.index != currentQuiz.questionsNumber) {
      const newQuestion = new current(this.index);
      newQuestion.display()
    } else {
      currentQuiz.displayResult();
    }
  }
}

async function startQuiz() {
  const qiuzOptions = {
    category: category.value,
    difficulty: difficulty.value,
    questionsNumber: questionsNumber.value
  }
  // validation on number of questions, must be from 1 to 50
  if (qiuzOptions.questionsNumber > 50) {
    qiuzOptions.questionsNumber = 50;
  } else if (qiuzOptions.questionsNumber < 0) {
    qiuzOptions.questionsNumber = 1;
  }

  startForm.classList.replace("d-flex", "d-none");
  currentQuiz = new quiz(qiuzOptions);
  questions = await currentQuiz.callAPI();

  const currentQuestion = new current(0);
  currentQuestion.display();
}

btnStartQuiz.addEventListener("click", () => { startQuiz() })
