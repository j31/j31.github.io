// Wait for DOM to load
$(document).ready(function() {
  
  function User (name, knowledge) {
    this.user = name
    this.knowledge = knowledge
  };
  
  //  Instantiate user
  var user1 = new User ("John", knowledge);
  console.log("user1 ", user1)
  
  // Main application Class
  function Evergreen (user) {
    this.user = user; 
    this.dict = dictionary;
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
  
  
  // Update score (on home page)
  Evergreen.prototype.updateScore = function () {
    var userStrength = ev.user.knowledge.reduce((a,b) => a + b.strength, 0);
    console.log("userStrength ", userStrength);
    ev.score = Math.round(userStrength / ( ev.user.knowledge.length * 5 )*100);
    
    console.log("score ", ev.score);
    $('#score').text(ev.score);
  }
  
  
  // Get question 
  Evergreen.prototype.getQuestion = function () {
    
    // find term with lower strength first
    var i = 0;
    var term = undefined;
    while (!term) {
      var term = ev.user.knowledge.find(function(t) {
        return t.strength === i;
      });
    console.log("i ",i)
    console.log("term ",term)
    i++
    }
    
    //  Store user knoweldge term into ev Class object
    ev.knowledgeTerm = term;
    var id = term.termId;
    
    // look up term in dictionary
    var t = ev.dict.find(function(t) {
      return t.termId === id;
    });
    
    //  Store Q & A into ev Class object
    ev.question = t.term;
    ev.answer = t.def;
    console.log(ev.question)
    //  Increment count number
    ev.questionNum += 1;
    console.log("Q num ", ev.questionNum)
    
    ev.updateProgress();
  }
  
  // Update progress (question number)
  Evergreen.prototype.updateProgress = function () {
    
    var percentDone = (ev.questionNum-1)*10;
    var html = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + percentDone +  '%"></div>'
    
    $('.progress').html(html);
    ev.displayQuestion();
  }
  
  
  // Display question
  Evergreen.prototype.displayQuestion = function () {
    $('.answer').html('');
    var html = "<h3>" + ev.question + "</h3>"
    $('.question').html(html);
    ev.revealAnswer();
  }
  
  
  // Reveal answer when Show button is clicked
  Evergreen.prototype.revealAnswer = function () {
    $('#show-answer-btn').removeClass('d-none')
    
    $('#show-answer-btn').unbind('click')
    
    $('#show-answer-btn').click(function(){
      $('#show-answer-btn').addClass('d-none');
      var html = "<p>" + ev.answer + "</p>"
      $('.answer').html(html);
      
      ev.getUserAnswer();
    });
  }
  
  // Get user answer
  Evergreen.prototype.getUserAnswer = function () {
    
    if (ev.knowledgeTerm.strength === 0) {
      $('#new-term').removeClass('d-none');
      
      $('#just-learned-btn').unbind('click');
      $('#just-learned-btn').click(function(){
        ev.knowledgeTerm.strength += 1;
        $('#new-term').addClass('d-none');
        flashcards();
      });
      
      $('#already-knew-btn').unbind('click');
      $('#already-knew-btn').click(function(){
        ev.knowledgeTerm.strength += 3;
        $('#new-term').addClass('d-none');
        flashcards();
      });
    } else {
    
      $('#old-term').removeClass('d-none')
    
      $('#knew-not-btn').unbind('click');
      $('#knew-not-btn').click(function(){
        ev.knowledgeTerm.strength -= 1;
        $('#old-term').addClass('d-none');
        flashcards();
      });
    
      $('#knew-it-btn').unbind('click');
      $('#knew-it-btn').click(function(){
        ev.knowledgeTerm.strength += 1;
        $('#old-term').addClass('d-none');
        flashcards();
      }); 
    }
  }
  
  //  Listen on home-menu buttons (Flashcards...)
  function homeMenu () {
    ev.updateScore()
    $('#flash-cards-btn').click(function(){
      $('#home-menu').toggleClass('d-none')
      initFlashcards () 
      flashcards();
    });
  }
  
  
  //  Init Flashcards
  function initFlashcards () {
    $('#flash-cards').toggleClass('d-none')
    ev.state = "flashcards";
    ev.knowledgeTerm = {};
    ev.question = "";
    ev.answer = "";
    ev.questionNum = 0;
    ev.score = 0;
    
    $('#close-btn').click(function(){
      $('#flash-cards').toggleClass('d-none');
      $('#home-menu').toggleClass('d-none');
    });
  };
  
  //  Flashcards 
  function flashcards () {
    if (ev.questionNum < 10) {
      ev.getQuestion();
    } else {
      showResults();
    }
  }
  
  function showResults () {
    $('#close-btn').addClass('d-none')
    $('#continue-btn').removeClass('d-none')
    
    $('.answer').html("");
    
    var percentDone = 100;
    var html = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + percentDone +  '%"></div>'
    $('.progress').html(html);
    ev.updateScore()
    console.log(ev.score)
    $('.question').html('<h3>You improved your score to ' + ev.score + '%!</h3>')
    
    $('#continue-btn').unbind('click');
    $('#continue-btn').click(function(){
      $('#continue-btn').addClass('d-none')
      $('#flash-cards').toggleClass('d-none');
      $('#home-menu').toggleClass('d-none');
      ev.updateScore()
    });
  }
  
  
  // Start main app
  homeMenu();
  
});

