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


// Quiz
function startQuiz() {
    console.log("Quiz started!"); // Log when the quiz starts
    document.getElementById('quiz-container').style.display = 'block'; // Show quiz container
    document.getElementById('start-quiz-button').style.display = 'none'; // Hide start button
    currentQuestionIndex = 0; // Reset the current question index
    score = 0; // Reset score
    document.getElementById('score-value').textContent = score; // Reset score display
    renderQuestion(); // Render the first question
}

function reviewQuiz() {
    const quizData = JSON.parse(localStorage.getItem('quizData'));
    const correctList = document.getElementById('correct-answers-list');
    const wrongList = document.getElementById('wrong-answers-list');
    const unattemptedList = document.getElementById('unattempted-questions-list');
    const summaryElement = document.getElementById('review-summary');

    
    // Clear previous content
    correctList.innerHTML = '';
    wrongList.innerHTML = '';
    unattemptedList.innerHTML = '';
    summaryElement.innerHTML = '';

    if (quizData) {
        // Display correct answers
        quizData.correct.forEach(item => {
            console.log("Checking correct answer for questionId:", item.questionId); // Log the questionId
            const question = questions.find(q => q.id === item.questionId); // Find the question by ID
            if (question) {
                const li = document.createElement('li');
                li.className = "bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-2"; // Tailwind classes for styling
                li.textContent = `Question: ${question.question}, Time Spent: ${item.timeSpent} seconds`;
                correctList.appendChild(li);
            } else {
                console.error(`Question with ID ${item.questionId} not found in questions array.`);
            }
        });

        // Display wrong answers
        quizData.wrong.forEach(item => {
            console.log("Checking wrong answer for questionId:", item.questionId); // Log the questionId
            const question = questions.find(q => q.id === item.questionId); // Find the question by ID
            if (question) {
                const li = document.createElement('li');
                li.className = "bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2"; // Tailwind classes for styling
                li.textContent = `Question: ${question.question}, Chosen Answer: ${item.chosenAnswer}, Correct Answer: ${item.correctAnswer}`;
                wrongList.appendChild(li);
            } else {
                console.error(`Question with ID ${item.questionId} not found in questions array.`);
            }
        });

        // Display unattempted questions
        quizData.unattempted.forEach(item => {
            console.log("Checking unattempted questionId:", item.questionId); // Log the questionId
            const question = questions.find(q => q.id === item.questionId); // Find the question by ID
            if (question) {
                const li = document.createElement('li');
                li.className = "bg-gray-100 border border-gray-400 text-gray-700 px-4 py-2 rounded mb-2"; // Tailwind classes for styling
                li.textContent = `Question: ${question.question} - Unattempted`;
                unattemptedList.appendChild(li);
            } else {
                console.error(`Question with ID ${item.questionId} not found in questions array.`);
            }
        });

        // Calculate average time spent
           // Calculate average time spent
           const totalQuestions = quizData.correct.length + quizData.wrong.length; // Total attempted questions
           const averageTime = totalQuestions > 0 ? (totalTimeSpent / totalQuestions).toFixed(2) : 0; // Average time per question
            const accuracy = (score/numberOfQuestions) * 100;
           // Display total and average time
           summaryElement.innerHTML = `
               <h3 class="text-xl font-semibold mb-2">Review Summary</h3>
               <p class="text-lg">Total Time Spent: <span class="font-bold">${totalTimeSpent} seconds</span></p>
               <p class="text-lg">Average Time per Question: <span class="font-bold">${averageTime} seconds</span></p>
               <p class="text-lg">Accuracy: <span class="font-bold">${accuracy}%</span></p>
           `;
       }

       // Show the review container
       document.getElementById('review-container').style.display = 'block';
   }


   function displayFinalScore() {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = ''; // Clear previous content

    const finalScoreElement = document.createElement('div');
    finalScoreElement.classList.add('final-score');

    finalScoreElement.innerHTML = `
        <h2>Quiz Completed!</h2>
        <p>Your final score is: ${score} out of ${questions.length}</p>
        <button id="restart-quiz-button">Restart Quiz</button>
    `;

    questionsContainer.appendChild(finalScoreElement);

    // Add event listener for the restart button
    document.getElementById('restart-quiz-button').addEventListener('click', restartQuiz);
}

function displayReview() {
    const quizData = JSON.parse(localStorage.getItem('quizData'));
    const correctList = document.getElementById('correct-answers-list');
    const wrongList = document.getElementById('wrong-answers-list');
    const unattemptedList = document.getElementById('unattempted-questions-list');

    correctList.innerHTML = ''; // Clear previous content
    wrongList.innerHTML = ''; // Clear previous content
    unattemptedList.innerHTML = ''; // Clear previous content

    if (quizData) {
        // Display correct answers
        quizData.correct.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `Question ID: ${item.questionId}, Time Spent: ${item.timeSpent} seconds`;
            correctList.appendChild(li);
        });

        // Display wrong answers
        quizData.wrong.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `Question ID: ${item.questionId}, Chosen Answer: ${item.chosenAnswer}, Correct Answer: ${item.correctAnswer}`;
            wrongList.appendChild(li);
        });

        // Display unattempted questions
        quizData.unattempted.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `Question ID: ${item.questionId} - Unattempted`;
            unattemptedList.appendChild(li);
        });
    }

    // Show the review container
    document.getElementById('review-container').style.display = 'block';
}


function restartQuiz() {
    // Clear stored quiz data
    localStorage.removeItem('quizData'); 
    
    // Reset the current question index and score
    currentQuestionIndex = 0; 
    score = 0; 
    correctAnswersCount = 0; // Reset correct answers count
    wrongAnswersCount = 0;   // Reset wrong answers count
    unattemptedCount = 0;    // Reset unattempted count

    // Update the score display
    document.getElementById('score-value').textContent = score; // Reset score display
    document.getElementById('review-container').style.display = 'none'; // Hide the review section
    
    // Load the first question
    loadQuestion(); 
}

//Answers

function selectAnswer(selectedIndex, answerItem, isCorrect) {
    clearInterval(timer); // Stop the timer when an answer is selected

    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswers = currentQuestion.answers.filter(answer => answer.correct).map(answer => answer.text);
    const remainingTime = parseInt(document.getElementById('time').textContent, 10); // Get the remaining time
    const timeSpent = 20 - remainingTime; // Calculate time spent
    totalTimeSpent += timeSpent; // Update the total time spent
    // Disable all answer options
    const answerItems = document.querySelectorAll('#questions-container li');
    answerItems.forEach(item => {
        item.style.pointerEvents = 'none'; // Disable further clicks
    });

    if (isCorrect) {
        score++; // Increment score if the answer is correct
        correctAnswersCount++; // Increment correct answers count
        answerItem.classList.add('correct'); // Highlight the correct answer
        saveQuestionData(true, timeSpent); // Save data for correct answer
    } else {
        wrongAnswersCount++; // Increment wrong answers count
        answerItem.classList.add('incorrect'); // Highlight the incorrect answer
        saveQuestionData(false, remainingTime, answerItem.textContent, correctAnswers[0]); // Save data for wrong answer
        showCorrectAnswer(); // Call the function to highlight the correct answer
    }

    // Update the score display
    document.getElementById('score-value').textContent = score; // Update score display

    // Show the Next button
    const nextButton = document.getElementById('next-button');
    nextButton.style.display = 'block';
}


function showCorrectAnswer() {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswers = currentQuestion.answers.filter(answer => answer.correct);

    // Highlight the correct answer(s)
    const answerItems = document.querySelectorAll('#questions-container li');
    answerItems.forEach(item => {
        const answerText = item.textContent;
        if (correctAnswers.some(answer => answer.text === answerText)) {
            item.classList.add('correct'); // Add a class to highlight the correct answer
        }
    });

    // Show the Next button
    const nextButton = document.getElementById('next-button');
    nextButton.style.display = 'block';
}

// Event listeners for the start & review quiz button
document.getElementById('start-quiz-button').addEventListener('click', startQuiz);

document.getElementById('next-button').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion(); // Load the next question
        document.getElementById('next-button').style.display = 'none'; // Hide the Next button
    } else {
        // Handle the end of the quiz (e.g., show final score)
        reviewQuiz();
    }
});

document.querySelector('#review').addEventListener('click', reviewQuiz)


// Initialize the quiz data
init();