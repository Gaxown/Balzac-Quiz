let questions = []; // Global variable to hold questions
let currentQuestionIndex = 0; // To track the current question
let timer; // Variable to hold the timer
let startTime; // To track when the question is started
let timeLeft = 20; // Time limit for each question
let score = 0; // Variable to keep track of the user's score
const numberOfQuestions = 5;
let correctAnswersCount = 0;
let wrongAnswersCount = 0;
let unattemptedCount = 0;
let totalTimeSpent = 0;

//Questions Handling

function getRandomQuestions(questions, numQuestions) {
    const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
    return shuffledQuestions.slice(0, Math.min(numQuestions, shuffledQuestions.length));
}

function loadQuestion() {
    // Check if there are questions to load
    if (currentQuestionIndex < questions.length) {
        renderQuestion(); // Call the renderQuestion function to display the current question
    } else {
        // If there are no more questions, display the final score or review
        displayFinalScore();
    }
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        // Load the next question
        loadQuestion();
    } else {
        // Quiz is over, display the review
        reviewQuiz();
        // displayReview();
    }
}

function renderQuestion() {
    console.log("Rendering question...");
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = ''; // Clear previous content

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
        console.error("No current question found!");
        return;
    }

    const questionElement = document.createElement('div');
    questionElement.classList.add('question');

    const questionText = document.createElement('h3');
    questionText.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
    questionElement.appendChild(questionText);

    const answersList = document.createElement('ul');
    currentQuestion.answers.forEach((answer, index) => {
        const answerItem = document.createElement('li');
        answerItem.textContent = answer.text;
        answerItem.addEventListener('click', () => selectAnswer(index, answerItem, answer.correct)); // Pass the correct flag
        answersList.appendChild(answerItem);
    });

    questionElement.appendChild(answersList);
    questionsContainer.appendChild(questionElement);
    startTimer(); // Start the timer for the current question
}

// Data Handling

function loadQuestion() {
    // Check if there are questions to load
    if (currentQuestionIndex < questions.length) {
        renderQuestion(); // Call the renderQuestion function to display the current question
    } else {
        // If there are no more questions, display the final score or review
        displayFinalScore();
    }
}

function saveQuestionData(isCorrect, timeSpent, chosenAnswer = null, correctAnswer = null) {
    let quizData = JSON.parse(localStorage.getItem('quizData')) || {
        correct: [],
        wrong: [],
        unattempted: []
    };

    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion.id; // Assuming each question has
    if (isCorrect) {
        correctAnswersCount++; // Increment correct answers count
        quizData.correct.push({ questionId, timeSpent });
    } else if (chosenAnswer !== null) { // Only save as wrong if an answer was chosen
        wrongAnswersCount++; // Increment wrong answers count
        quizData.wrong.push({ questionId, chosenAnswer, correctAnswer });
    }

    localStorage.setItem('quizData', JSON.stringify(quizData));
}

async function loadData() {
    const response = await fetch('./data.json');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data; // Return the parsed JSON data
}

async function init() {
    try {
        questions = await loadData(); // Load questions
        questions = getRandomQuestions(questions, numberOfQuestions); // Get 10 random questions
        console.log(questions); // Log the loaded questions
    } catch (error) {
        console.error('Error loading data:', error);
    }
}