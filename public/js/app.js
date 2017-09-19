
//Button interactions
//======================

// When user clicks the "saved articles" button, display SAVED article list
$("#save").on("click", function() {
  $.ajax({
    type: "PUT",
    url: "/saved",
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

