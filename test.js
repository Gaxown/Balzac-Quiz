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

// Timer Handling

function startTimer() {
    clearInterval(timer); 
    timeLeft = 20; 
    document.getElementById('time').textContent = timeLeft; 
    const timerProgress = document.getElementById('timer-progress');
    timerProgress.style.width = '100%'; // Reset the progress bar to full width
    timerProgress.className = 'absolute h-full rounded transition-all duration-1000'; // Reset class

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft; 
        // Calculate the percentage of time left
        const percentageLeft = timeLeft / 20 * 100;
        timerProgress.style.width = `${percentageLeft}%`; 

        // Change the color of the progress bar based on the remaining time
        if (percentageLeft > 50) {
            timerProgress.classList.add('bg-green-500'); // Green for > 50%
            timerProgress.classList.remove('bg-yellow-500', 'bg-red-500');
        } else if (percentageLeft > 25) {
            timerProgress.classList.add('bg-yellow-500'); // Yellow for 25% to 50%
            timerProgress.classList.remove('bg-green-500', 'bg-red-500');
        } else {
            timerProgress.classList.add('bg-red-500'); // Red for < 25%
            timerProgress.classList.remove('bg-green-500', 'bg-yellow-500');
        }

        if (timeLeft <= 0) {
            clearInterval(timer); 
            // goToNextQuestion(); 
            handleTimeOut(); // Call the function to handle timeout
            showCorrectAnswer(); // Call the function to highlight the correct answer
        }
    }, 1000); 
}


function handleTimeOut() {
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion.id; // Assuming each question has a unique ID
    
    // Save the unattempted question
    let quizData = JSON.parse(localStorage.getItem('quizData')) || {
        correct: [],
        wrong: [],
        unattempted: []
    };
    
    unattemptedCount++;
    quizData.unattempted.push({ questionId });
    localStorage.setItem('quizData', JSON.stringify(quizData));

    // Show the Next button
    const nextButton = document.getElementById('next-button');
    nextButton.style.display = 'block'; // Show the Next button
}
