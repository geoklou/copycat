// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// var mongoose = require("mongoose");
// Require request and cheerio to scrape web contents
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

//set public/index.html to be the default homepage
app.use(express.static("public"));

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (home)
app.get("/", function(req, res) {
  res.send("Web Scrapper Home");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

app.get("/scrape", function(req, res) {
  // Make a request for the news section of pc magazine
  request("https://www.pcmag.com/news", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);

    // With cheerio, find each div-tag with the "article-deck" class
    // (i: iterator. element: the current element)
  $("div.article-deck").each(function(i, element) {
    // Save the text of each link enclosed in the current element
    var title = $(element).children('a').text().replace('Read More', '');
    // Save the values with "href" attributes in child element a-tags of selected element 
    var link = $(element).children().attr("href");
    // Save the values in child element p-tags for summary/gist
    var summary = $(element).children('p.hide-for-small-only').text();

      // If this found element had both a title, a gist and a link
      if (title && summary && link) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          summary: summary,
          link: link
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

//////////////
//for console only
// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link from PC Magazine:" +
            "\n***********************************\n");

// Making a request for pcmag's news page. the HTML is passed as the callback's third argument
request("https://www.pcmag.com/news", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' of cheerio's = jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var results = [];

  // With cheerio, find each p-tag with the "title" class
  // (i: iterator. element: the current element)
  $("div.article-deck").each(function(i, element) {
    var title = $(element).children('a').text().replace('Read More', '');
    // in selected element. look for child element a-tags, save values with "href" attributes 
    var link = $(element).children().attr("href");
    // in selected element, look for child element p-tags with class for summary/gist & save the values
    var summary = $(element).children('p.hide-for-small-only').text();
    // var image = $(element).children().attr('img src');
    
    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      summary: summary,
      link: link
});
  // Log results with cheerio
  console.log(results);
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});