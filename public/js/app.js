
//Menu and buttons
//======================

// click menu "saved article" t0 see SAVED article list
$("#save").on("click", function() {
  $.ajax({
    type: "PUT",
    url: "/articles/:id",
    dataType: "json",
    data: {
      _id: req.params.id,
      saved: true
    }
  })
.done(function(data){
  console.log(data);
});
});

//click "delete article" button to delete article
$("#deleteArticle").on("click", function() {
  // Make an AJAX GET request to delete the article from the db
  $.ajax({
    type: "DELETE",
    url: "/articles/:id",
    dataType: "json",
    // method: 'DESTROY',
    data: {
      _id: req.params.id
    },
    // On a successful call
    success: function(response) {
      console.log(response);
    }
  });
});

//save note button
$("#saveNote").on("click", function() {
  $.ajax({
    type: "PUT",
    dataType: "json",
    url: "/articles/:id",
    data: {
      _id: req.params.id,
      notes: $("#note").val()
    }
  })
  .done(function(data){
    console.log(data);
    var noteText = $("<p>");
    noteText.text($("#note").val());
    $("#NoteContent").append(noteText);
  });
});


//click "count scraped"" button to see number of articles in db
var count = 0;
$("#count").on("click", function() {
    scrapeCount();   
});

//function to count articles
function scrapeCount(){
  $.getJSON("/articles", function(data) {
    //reset count to zero
    count = 0;
    for (var i = 0; i < data.length; i++){
      count++;
    }
      console.log(count);
      var displayCount = $("<span>");
      displayCount.html(count);
      $("#modalContent").append(displayCount);
    });
}

var savedCount;
$("#save-count").on("click", function() {
  saveCount();
  
});

function saveCount(){
  $.getJSON("/articles", function(data) {
    //reset savedCount to zero
    savedCount = 0;
    for (var i = 0; i < data.length; i++){
      if ( data[i].saved === true ){
        savedCount++;
      }
    }
      console.log(savedCount);
      var displaySavedCount = $("<span>");
      displaySavedCount.html(savedCount);
      $("#savedQty").append(displaySavedCount);
    });
}

