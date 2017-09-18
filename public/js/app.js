var count;
function scrapeCount(){
app.get("/scrape", function(req, res) {
  // Make a request for the news section of pc magazine
  request("https://www.pcmag.com/news", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // With cheerio, find each div-tag with the "article-deck" class
    // (i: iterator. element: the current element)
  $("div.article-deck").each(function(i, element) {
    var result = {};
    // Save the text of each link enclosed in the current element
    result.title = $(this).children('a').text().replace('Read More', '');
    // Save the values with "href" attributes in child element a-tags of selected element 
    result.link = $(this).children().attr("href");
    // Save the values in child element p-tags for summary/gist
    result.summary = $(this).children('p.hide-for-small-only').text();

      // if (title && summary && link) {
        var entry = new Article(result);
        //only save articles with new URL
        for (var i = 0; i < element.length ; i++){
          if (this.link !== element.link[i]){
        // Insert the data in the scrapedData db
        entry.save(function(err, doc) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(doc);
            count++;
            console.log(count);
            var displayCount = ("<span>");
            displayCount.html(count);
            $("#modalContent").append(displayCount);
          }
          // res.render("scrape", doc);
        });
      }
     
    }
    res.render("scrape", result);
    });
  
  });
  // Send a "Scrape Complete" message to the browser
  // res.send("Scrape complete");
});
}

//takes in 'articles' (JSON) and creates a table body
function displayResults(articles) {
  // First, empty the table
  $("tbody").empty();

  // Then, for each entry of that json...
  articles.forEach(function(article) {
    // Append each of the article's properties to the table
    $("tbody").append("<tr><td>" + article.title + "</td>" +
                         "<td>" + article.summary+ "</td>" +
                         "<td>" + article.link + "</td></tr>" 
                        );
  });
}

//Button interactions
//======================

// When user clicks the "saved articles" button, display SAVED article list
$("#saved").on("click", function() {
$.getJSON("/saved", function(data) {
  // Call our function to generate a table body
  displayResults(data);
});
});

  // Do an api call to the back end for json with all article saved
  // $.getJSON("/saved", function(data) {
  //   // Call our function to generate a table body
  //   displayResults(data);
  // });

// When user clicks the "scrape new articles" button, display NEW article list
$("#scrapped").on("click", function() {
  // Do an api call to the back end for json with all articles scrapped
  $.getJSON("/", function(data) {
    // Call our function to generate a table body
    displayResults(data);
  });
});

