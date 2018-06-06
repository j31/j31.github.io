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
    $('#flash-cards-btn').unbind('click');
    $('#flash-cards-btn').click(function(){
      $('#home-menu').toggleClass('d-none')
      $('#navigation').toggleClass('d-none')
      ev.initFlashcards () 
      ev.flashcards();
    });
    
    $('#quiz-btn').unbind('click');
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
    
    $('#quiz-close-btn').unbind('click');
    $('#quiz-close-btn').click(function(){
      $('#quiz').toggleClass('d-none');
      $('#home-menu').toggleClass('d-none');
      $('#navigation').toggleClass('d-none');
      ev.updateScore();
    });
  }
  
  //  Quiz 
  Evergreen.prototype.quiz = function () {
    if (ev.questionNum < 10) {
      $('#check-answer-btn').removeClass('d-none');
      $("#check-answer-btn").addClass('disabled');
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
  
  // Reveal Answer(s)
  Evergreen.prototype.revealAnswer = function () {
    
    // for FLASHCARDS display answer when show button is clicked
    if (ev.state === "flashcards") {
      $('#show-answer-btn').removeClass('d-none')
      
      
      // on [ENTER] ...
      $(document).unbind('keypress')
      $(document).keypress(function(e) {
        if(e.which == 13 && !$("#show-answer-btn").hasClass('d-none')) {
          $('#show-answer-btn').addClass('d-none');
          var html = '<p class="answer-text">' + ev.answer + '</p>'
          $('.answer').html(html);
          
          ev.getUserAnswer();
        }
      });
      
      // on CLICK ...
      $('#show-answer-btn').unbind('click')
      $('#show-answer-btn').click(function(){
        $('#show-answer-btn').addClass('d-none');
        var html = '<p class="answer-text">' + ev.answer + '</p>'
        $('.answer').html(html);
        
        ev.getUserAnswer();
      });
    } 
    
    // for QUIZ display multiple choice answers
    if (ev.state === "quiz") {
      
      var html = '<div id="answer-box1" class="quiz-answer"><div class="form-check"><input class="form-check-input" type="radio" name="quiz-answer" id="quiz-answer1" value="option1"><label class="form-check-label" for="quiz-answer1">&nbsp; 1. <span id="answer1"></span></label></div></div><div id="answer-box2" class="quiz-answer"><div class="form-check"><input class="form-check-input" type="radio" name="quiz-answer" id="quiz-answer2" value="option2"><label class="form-check-label" for="quiz-answer2">&nbsp; 2. <span id="answer2"></span></label></div></div><div id="answer-box3" class="quiz-answer"><div class="form-check"><input class="form-check-input" type="radio" name="quiz-answer" id="quiz-answer3" value="option3"><label class="form-check-label" for="quiz-answer3">&nbsp; 3.  <span id="answer3"></span></label></div></div><div id="answer-box4" class="quiz-answer"><div class="form-check"><input class="form-check-input" type="radio" name="quiz-answer" id="quiz-answer4" value="option4"><label class="form-check-label" for="quiz-answer4">&nbsp; 4.  <span id="answer4"></span></label></div></div>'
      $('.answer').html(html);
      
      
      //uncheck all checkboxes, clear highighting
      $('input[type="radio"]').prop('checked', false);
      $(".quiz-answer").css("background-color", "");
      
      
      
      
      var answers = []
      
      // add correct answer to answer array
      answers.push(ev.answer)
      
      
      // for the three decoy answers
      for (var x=0; x<3; x++) {
        
        // pick a term iD at random from the dictionary, make sure it's not answer
        var randomId = ev.knowledgeTerm.termId
        while (randomId === ev.knowledgeTerm.termId ) {
          randomId = Math.floor(Math.random() * ev.dict.length)+1
        }
        
        // look this random ID up in the dictionary
        var term = ev.dict.find(function(t) {
          return t.termId === randomId;
        });
        
        // add decoy answer to answers array
        answers.push(term.def)
      }
      
      // display answers in random order on page
      for (var x=1; x<=4; x++) {
        var random = Math.floor(Math.random() * answers.length)
        $('#answer' + x).text(answers[random])
        answers.splice(random,1)
      }
      
      ev.getUserChoice();
    }
  }
  
  
  // Get user response on FLASHCARDS (wrong/correct buttons)
  Evergreen.prototype.getUserAnswer = function () {
    $('.check-btn').removeClass('d-none');
    
    // <==  LEFT ARROW 
    $(document).unbind('keypress')
    $(document).keypress(function(e) {
      if(e.which == 119 ) {
        if (ev.knowledgeTerm.strength === 0)
        ev.knowledgeTerm.strength = 1;
        else
        ev.knowledgeTerm.strength -= 1;
        $('.check-btn').addClass('d-none');
        
        ev.flashcards();
      }
    });
    
    // <==  RIGHT ARROW 
   
    $(document).keypress(function(e) {
      if(e.which == 99 ) {
        if (ev.knowledgeTerm.strength === 0)
        ev.knowledgeTerm.strength = 2;
        else if (ev.knowledgeTerm.strength === 5)
        ev.knowledgeTerm.strength = 5;
        else
        ev.knowledgeTerm.strength += 1;
        $('.check-btn').addClass('d-none');
        
        ev.flashcards();
      }
    });
    
    
    // WRONG button
    $('#wrong-btn').unbind('click');
    $('#wrong-btn').click(function(){
      if (ev.knowledgeTerm.strength === 0)
      ev.knowledgeTerm.strength = 1;
      else
      ev.knowledgeTerm.strength -= 1;
      $('.check-btn').addClass('d-none');
      
      ev.flashcards();
    });
    
    // CORRECT button
    $('#correct-btn').unbind('click');
    $('#correct-btn').click(function(){
      if (ev.knowledgeTerm.strength === 0)
      ev.knowledgeTerm.strength = 2;
      else if (ev.knowledgeTerm.strength === 5)
      ev.knowledgeTerm.strength = 5;
      else
      ev.knowledgeTerm.strength += 1;
      $('.check-btn').addClass('d-none');
      
      ev.flashcards();
    }); 
  }
  
  
  
  
  // Get user response on QUIZ (multiple choice)
  Evergreen.prototype.getUserChoice = function () {
    
    
    // IF (#)then...
    
    $(document).unbind('keypress')
    $(document).keypress(function(e) {
      if(e.which == 49) {
        $('#quiz-answer1').prop('checked', true);
        $("#check-answer-btn").removeClass('disabled');
      }
      if(e.which == 50) {
        $('#quiz-answer2').prop('checked', true);
        $("#check-answer-btn").removeClass('disabled');
      }
      if(e.which == 51) {
        $('#quiz-answer3').prop('checked', true);
        $("#check-answer-btn").removeClass('disabled');
      }
      if(e.which == 52) {
        $('#quiz-answer4').prop('checked', true);
        $("#check-answer-btn").removeClass('disabled');
      }
      if(e.which == 13 && !$("#check-answer-btn").hasClass("disabled")) {
        ev.checkUserChoice();
      }
    });
    
    // enable check-answer-btn when radio selection made
    $("input:radio").change(function () {
      $("#check-answer-btn").removeClass('disabled');
    });
    
    // $(document).keypress(function(e) {
    //   if(e.which == 13 && $("#check-answer-btn").prop('disabled', false ));  {
    //     ev.checkUserChoice();
    //   }
    // });
    
    //  bind correction logic to check button
    $('#check-answer-btn').click(function(){
      ev.checkUserChoice(); 
    });
  }
  
  
  Evergreen.prototype.checkUserChoice = function () {
    // determine which answer was selected
    if ($('input[name=quiz-answer]:checked').val() === 'option1'){
      var selection = $('#answer1').text()
      var selectionNum = 1;
    }
    
    if ($('input[name=quiz-answer]:checked').val() === 'option2'){
      var selection = $('#answer2').text()
      var selectionNum = 2;
    }
    
    if ($('input[name=quiz-answer]:checked').val() === 'option3'){
      var selection = $('#answer3').text()
      var selectionNum = 3;
    }
    
    if ($('input[name=quiz-answer]:checked').val() === 'option4'){
      var selection = $('#answer4').text()
      var selectionNum = 4;
    }
    
    
    //  Highlight correct answer
    if ( $('#answer1').text() === ev.answer )
    $("#answer-box1").css("background-color", "lightgreen");
    if ( $('#answer2').text() === ev.answer )
    $("#answer-box2").css("background-color", "lightgreen");
    if ( $('#answer3').text() === ev.answer )
    $("#answer-box3").css("background-color", "lightgreen");
    if ( $('#answer4').text() === ev.answer )
    $("#answer-box4").css("background-color", "lightgreen");
    
    
    // determine if selection matches answer
    var isCorrect = (selection === ev.answer)
    
    
    // IF SELECTION is WRONG
    if (!isCorrect) {
      if (ev.knowledgeTerm.strength === 0)
      ev.knowledgeTerm.strength = 1;
      else
      ev.knowledgeTerm.strength -= 1;
      $('#check-answer-btn').addClass('d-none');
      $('.incorrect').removeClass('d-none');
    };
    
    // IF SELECTION is CORRECT
    if (isCorrect) {
      if (ev.knowledgeTerm.strength === 0)
      ev.knowledgeTerm.strength = 3;
      else if (ev.knowledgeTerm.strength === 5)
      ev.knowledgeTerm.strength = 5;
      else
      ev.knowledgeTerm.strength += 1;
      $('#check-answer-btn').addClass('d-none');
      $('.correct').removeClass('d-none');
    }; 
    
    
    //  bind correction logic to check button & to [ENTER]
    $('#continue-quiz-btn').removeClass('d-none');
    
    // IF [ENTER]  then...
    
    $(document).unbind('keypress')
    $(document).keypress(function(e) {
      if(e.which == 13 && !$("#continue-quiz-btn").hasClass("d-none")) {
        $('#continue-quiz-btn').addClass('d-none');
        $('.correct').addClass('d-none');
        $('.incorrect').addClass('d-none');
        ev.quiz();
      }
    });
    
    // IF CLICK  then...
    $('#continue-quiz-btn').unbind('click')
    $('#continue-quiz-btn').click(function(){
      
      $('#continue-quiz-btn').addClass('d-none');
      $('.correct').addClass('d-none');
      $('.incorrect').addClass('d-none');
      ev.quiz();
    })
  }
  
  
  Evergreen.prototype.showResults = function () {
    $('#close-btn').addClass('d-none')
    $('.continue-btn').removeClass('d-none')
    $('.answer').html("");
    
    var percentDone = 100;
    var html = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + percentDone +  '%"></div>'
    $('.progress').html(html);
    ev.updateScore()
    console.log(ev.score)
    $('.question').html('<h3>Your new score is ' + ev.score + '%!</h3>')
    
    $('.continue-btn').unbind('click');
    $('.continue-btn').click(function(){
      $('.continue-btn').addClass('d-none')
      $('#home-menu').toggleClass('d-none');
      $('#navigation').toggleClass('d-none');
      
      if (ev.state === "flashcards")
      $('#flash-cards').toggleClass('d-none');
      
      if (ev.state === "quiz")
      $('#quiz').toggleClass('d-none');
      ev.homeMenu()
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

