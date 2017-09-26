
//Menu and buttons
//======================

// click 'save article' button to save article
$("#save").on("click", function() {
  $.ajax({
    type: "UPDATE",
    url: "/api/articles/:id",
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

// $("#deleteArticle").on("click", function() {
//   // Make an AJAX GET request to delete the article from the db
//   $.ajax({
//     type: "DELETE",
//     url: "/articles/:id",
//     dataType: "json",
//     // method: 'DESTROY',
//     data: {
//       _id: req.params.id
//     },
//     // On a successful call
//     success: function(response) {
//       console.log(response);
//     }
//   });
// });
//click "delete article" button to delete article
// $("#deleteArticle").on("click", function() {
//   // Make an AJAX GET request to delete the article from the db
//   $.ajax({
//     method: "DELETE",
//     dataType: "json",
//     url: "/api/articles/:id",
//     data: {
//       _id: req.params.id
//     }
//   })
//   .done(function(data) {
//     console.log(data);
//   });
// });

/////////////////////////save note and view note
//save note button
$("#saveNote").on("click", function() {
  $.ajax({
    type: "UPDATE",
    dataType: "json",
    // url: "/submit",
    url: "/articles/:id",
    // data: {
    //   _id: req.params.id,
    //   notes: $("#note").val()
    // }
  })
  .done(function(data){
    console.log(data);
    // var noteText = $("<span>");
    // noteText.text($("#note").val());
    // noteText.text(data);
    // $("#NoteContent").append(noteText);
  });
});

//view note button
$("#viewNote").on("click", function() {
  $.ajax({
    type: "GET",
    dataType: "json",
    // url: "/submit",
    url: "articles/notes",
    data: {
      notes: $("#note").val()
    }
  })
  .done(function(data){
    console.log(data);
    var noteText = $("<span>");
    noteText.text($("#note").val());
    noteText.text(data);
    $("#NoteContent").append(noteText);
  });
});

//click "count scraped"" button to see number of articles in db
var count;
$("#count").on("click", function() {
    scrapeCount();  
    // count = 0; 
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
  // savedCount = 0;
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

