
//Button interactions
//======================

// When user clicks the "saved article" button, display SAVED article list
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

$("#deleteArticle").on("click", function() {

});


// When user clicks the "count scraped"" button, display number of articles in the db
$("#count").on("click", function() {
    scrapeCount();
});

//function to count articles
var count = 0;
function scrapeCount(){
  $.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++){
      count++;
    }
      console.log(count);
      var displayCount = $("<span>");
      displayCount.html(count);
      $("#modalContent").append(displayCount);
    });
}

