// Wait for DOM to load
$(document).ready(function() {
  
  // User class, to simulate multiple users...
  function User (name, knowledge) {
    this.user = name
    this.knowledge = knowledge
  };
  
  //  Instantiate user1
  var user1 = new User ("John", knowledge);
  console.log("user1 ", user1)
  
  // Main application Class
  function Evergreen (user) {
    this.user = user; 
    this.dict = dictionary;
    this.knowledgeOutput = "";
    this.state = "home";
    this.score = 0;
    this.knowledgeTerm = {};
    this.question = "";
    this.answer = "";
    this.questionNum = 0;
  };
  
  //  Instantiate Evergreen session object
  var ev = new Evergreen (user1);
  console.log("ev ", ev)
  
  
  //  Listen on home-menu buttons (Flashcards...)
  Evergreen.prototype.homeMenu = function () {
    ev.updateScore()
    $('#flash-cards-btn').click(function(){
      $('#home-menu').toggleClass('d-none')
      $('#navigation').toggleClass('d-none')
      ev.initFlashcards () 
      ev.flashcards();
    });
    
    $('#quiz-btn').click(function(){
      $('#home-menu').toggleClass('d-none')
      $('#navigation').toggleClass('d-none')
      ev.initQuiz () 
      ev.quiz();
    });
    
  }
  
  //  Init Quiz
  Evergreen.prototype.initQuiz = function () {
    $('#quiz').toggleClass('d-none')
    ev.state = "quiz";
    ev.knowledgeTerm = {};
    ev.question = "";
    ev.answer = "";
    ev.questionNum = 0;
    ev.score = 0;
  }
  
  //  Quiz 
  Evergreen.prototype.quiz = function () {
    if (ev.questionNum < 10) {
      ev.getQuestion();
    } else {
      ev.showResults();
    }
  }
  
  
  //  Init Flashcards
  Evergreen.prototype.initFlashcards = function () {
    $('.check-btn').addClass('d-none');
    $('#flash-cards').toggleClass('d-none')
    ev.state = "flashcards";
    ev.knowledgeTerm = {};
    ev.question = "";
    ev.answer = "";
    ev.questionNum = 0;
    ev.score = 0;
    
    $('#close-btn').unbind('click');
    $('#close-btn').click(function(){
      $('#flash-cards').toggleClass('d-none');
      $('#home-menu').toggleClass('d-none');
      $('#navigation').toggleClass('d-none');
      ev.updateScore();
    });
  };
  
  //  Flashcards 
  Evergreen.prototype.flashcards = function () {
    if (ev.questionNum < 10) {
      
      ev.getQuestion();
    } else {
      ev.showResults();
    }
  }
  
  // Update score (on home page)
  Evergreen.prototype.updateScore = function () {
    
    // find sum of user strength scores
    var userStrength = ev.user.knowledge.reduce((a,b) => a + b.strength, 0);
    console.log("userStrength ", userStrength);
    
    // divide by total possible strength scores to get %, save in session object
    ev.score = Math.round(userStrength / ( ev.user.knowledge.length * 5 )*100);
    
    // update score in DOM
    $('#score').text(ev.score);
  }
  
  
  // Get question 
  Evergreen.prototype.getQuestion = function () {
    
    // Find term with lower strength first
    var i = 0;
    var term = undefined;
    while (!term) {
      var term = ev.user.knowledge.find(function(t) {
        return t.strength === i;
      });
      i++
    }
    
    //  store user knoweldge term into ev Class object
    ev.knowledgeTerm = term;
    
    // look up term in dictionary
    var t = ev.dict.find(function(t) {
      return t.termId === ev.knowledgeTerm.termId;
    });
    
    //  Store Q & A into ev Class object
    ev.question = t.term;
    ev.answer = t.def;
    
    //  Increment count number
    ev.questionNum += 1;
    
    ev.updateProgress();
  }
  
  // Update progress (question number)
  Evergreen.prototype.updateProgress = function () {
    
    // calculate percent done of 10 question set
    var percentDone = (ev.questionNum-1)*10;
    
    // build HTML
    var html = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + percentDone +  '%"></div>'
    
    // update DOM
    $('.progress').html(html);
    
    ev.displayQuestion();
  }
  
  
  // Display question
  Evergreen.prototype.displayQuestion = function () {
    
    if (ev.state === "flashcards") {
      $('.answer').html('');
    }
    var html = "<h3>" + ev.question + "</h3>"
    $('.question').html(html);
    
    ev.revealAnswer();
  }
  
  // Reveal answer when Show button is clicked
  Evergreen.prototype.revealAnswer = function () {
    
    if (ev.state === "flashcards") {
      $('#show-answer-btn').removeClass('d-none')
      // reset onClick function to reveal answer
      $('#show-answer-btn').unbind('click')
      $('#show-answer-btn').click(function(){
        $('#show-answer-btn').addClass('d-none');
        var html = '<p class="answer-text">' + ev.answer + '</p>'
        $('.answer').html(html);
        
        ev.getUserAnswer();
      });
      
    } else if (ev.state === "quiz") {
      //
      //  
      var answers = []
      answers.push(ev.answer)
      answers.push("The longer someone is away, the more you realize how much you love or miss them.");
      answers.push("What someone actually does means more than what they say they will do.");
      answers.push("Even if you are late with a commitment, it's still important to follow through.")
      
      for (var x=1; x<=4; x++) {
        var random = Math.floor(Math.random() * answers.length)
        $('#answer' + x).text(answers[random])
        answers.splice(random,1)
      }
    }
  }
  
  // Get user response (wrong/correct buttons)
  Evergreen.prototype.getUserAnswer = function () {
    $('.check-btn').removeClass('d-none');
    
    // reset binding and adjust strength
    $('#wrong-btn').unbind('click');
    $('#wrong-btn').click(function(){
      if (ev.knowledgeTerm.strength === 0)
      ev.knowledgeTerm.strength = 1;
      else
      ev.knowledgeTerm.strength -= 1;
      $('.check-btn').addClass('d-none');
      
      ev.flashcards();
    });
    
    $('#correct-btn').unbind('click');
    $('#correct-btn').click(function(){
      if (ev.knowledgeTerm.strength === 0)
      ev.knowledgeTerm.strength = 3;
      else if (ev.knowledgeTerm.strength === 5)
      ev.knowledgeTerm.strength = 5;
      else
      ev.knowledgeTerm.strength += 1;
      $('.check-btn').addClass('d-none');
      
      ev.flashcards();
    }); 
  }
  
  
  Evergreen.prototype.showResults = function () {
    $('#close-btn').addClass('d-none')
    $('#continue-btn').removeClass('d-none')
    $('.answer').html("");
    
    var percentDone = 100;
    var html = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + percentDone +  '%"></div>'
    $('.progress').html(html);
    ev.updateScore()
    console.log(ev.score)
    $('.question').html('<h3>Your new score is ' + ev.score + '%!</h3>')
    
    $('#continue-btn').unbind('click');
    $('#continue-btn').click(function(){
      $('#continue-btn').addClass('d-none')
      $('#flash-cards').toggleClass('d-none');
      $('#home-menu').toggleClass('d-none');
      $('#navigation').toggleClass('d-none');
      ev.updateScore()
    });
  }
  
  // NOT WORKING!!  The object is not the most current, but rather the initial one...
  function updateKnowledgeOutput () {
    // update the use knowledge output string (since we have no DB)
    value = "var knowledge = " + JSON.stringify(ev.user.knowledge)
    $('#user1-textarea').val(value)
  }
  // bind update button to user-knowledge output textarea
  $('#user1-textarea-btn').click(function(){
    updateKnowledgeOutput ();
  });
  
  // Start main app
  ev.homeMenu();
  
});

