// Dependencies
var express = require("express");
// var mongojs = require("mongojs");
var mongoose = require("mongoose");
var logger = require("morgan");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
// Require request and cheerio to scrape web contents
var request = require("request");
var cheerio = require("cheerio");
// Bring in our Models: Article and Note
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

//Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/copycat");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// // Database configuration
// var databaseUrl = "copycat";
// var collections = ["articles"];

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
// Set Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Main route (home)
app.get("/", function(req, res) {
  Article.find({}, function(error, doc) {
    var hbsObject = {
      Article: doc
    };
    console.log(hbsObject);
    res.render("index", hbsObject);
  })
  // res.send("Web Scrapper Home");
});


// app.get("/", function(req, res) {
//   res.send("Web Scrapper Home");
// });

var count;

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


//////////////// Retrieve all data from the db
app.get("/articles", function(req, res) {
  // Find all results from the scrapedData collection in the db
Article.find({}, function(error, doc) {
    // Throw any errors to the console
    if (error) {
      console.send(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(doc);
    }
  });
});

//button "save article" post saved article
app.put("/save/:id", function(req, res){
  const savedDoc = new Article({
    _id: req.params.id,
    saved: true,
  });
  Article.update(savedDoc, function(err, doc){
    if (err) {
      res.send(err);
    }
    else {
      console.log(doc);
      res.send("SAVED: "+ doc);
  }
});
});

//add note
app.post("/addNote", function(req, res){
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
  if (error) {
    res.send(error);
  }
    else {
      Article.findOneAndUpdate({}, { $push: {"notes": doc_id}}, {new:true}, function(err, newDoc){
        if (err) {
          res.send(err);
        }
        else {
          red.send(newDoc);
        }
      });
    }
});
});

// Retrieve saved data from the db
app.get("/saved", function(req, res) {
  // Find all results from the scrapedData collection in the db
  Article.find({"saved":"true"}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.render("saved", found);
      // res.json(found);
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

//////////////
//for console test only
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


