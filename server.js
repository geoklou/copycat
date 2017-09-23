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

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
// Set Handlebars
var exphbs = require("express-handlebars");
// exphbs.handlebars.registerHelper('paginateHelper', paginateHelper.createPagination);

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Main route (home)
//show background and intro message if any
app.get("/", function(req, res) {
  //below replaced by background image - data shown in scrape page
  Article.find({}, function(error, doc) {
    var hbsObject = {
      Article: doc
    };
    console.log(hbsObject);
    res.render("index", hbsObject);
  })
});

app.get("/scrape", function(req, res) {
  // Make a request for the news section of pc magazine
  request("https://www.pcmag.com/news", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // With cheerio, find each div-tag with the "article-deck" class
    // (i: iterator. element: the current element)
    var newArticles = [];

    $("div.article-deck").each(function(i, element) {
      var result = {};
      // Save the text of each link enclosed in the current element
      result.title = $(this).children('a').text().replace('Read More', '');
      // Save the values with "href" attributes in child element a-tags of selected element 
      result.link = $(this).children().attr("href");
      // Save the values in child element p-tags for summary/gist
      result.summary = $(this).children('p.hide-for-small-only').text();
      newArticles.push(result);
    });

    Article.insertMany(newArticles, function (error, docs) {
      if (!error) {
        var hbsObject = {
          Article: docs
        };
        res.render('scrape', hbsObject);
      }
    }).catch(function (error) {
      Article.find({}, function (error, docs) {
        var hbsObject = {
          Article: docs
        };
        res.render('scrape', hbsObject);
      })
    });
  });
});

//Retrieve all data from db
app.get("/articles", function(req, res) {
// Find all results from db
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

// Retrieve saved data from the db
app.get("/saved", function(req, res) {
  // Find all results from db
  Article.find({"saved":true}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      var hbsObject = {
        Article: found
      };
      res.render('saved', hbsObject);
      // res.json(found);
    }
  });
});

// Delete One from the DB
app.get("/articles/:id", function(req, res) {
  // Remove article using the objectID
  Article.deleteOne({"_id": req.params.id}, function(error, removed) {
    // Log errors
    if (error) {
      console.log(error);
      res.send(error);
    }
    else {
      console.log(removed);
      //return to homepage
      res.redirect("/");
    }
  });
});

//button "save article" to save article
app.put("/articles/:id", function(req, res){
  // save an article with the id
  Article.findOneAndUpdate({
    "_id": req.params.id
  }, {
    $set: {
      "saved": true
    }
  },
  function(err, doc){
    if (err) {
      res.send(err);
    }
    else {
      console.log(doc);
      res.redirect('/');
  }
});
});

//add note
app.put("/articles/:id", function(req, res){
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
  if (error) {
    res.send(error);
  }
    else {
      Article.findOneAndUpdate({},
        { $push: 
          {
            "_id": req.params.id,
            "notes": doc._id
          }
          }, 
        {
          new:true}, function(err, newDoc){
          if (err) {
            res.send(err);
        }
          else {
            // res.redirect('/');
            red.send(newDoc);
        }
      });
    }
  });
});

// Retrieve saved data from the db to enable viewing note
app.get("/review", function(req, res) {
  // Find all results from the scrapedData collection in the db
  Article.find({"saved":true})
    .populate("notes")
    .exec(function(error, found){
   
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.render("review", { Article: found });
      // res.json(found);
      console.log(found);
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
// request("https://www.pcmag.com/news", function(error, response, html) {

//   // Load the HTML into cheerio and save it to a variable
//   // '$' of cheerio's = jQuery's '$'
//   var $ = cheerio.load(html);

//   // An empty array to save the data that we'll scrape
//   var results = [];

//   // With cheerio, find each p-tag with the "title" class
//   // (i: iterator. element: the current element)
//   $("div.article-deck").each(function(i, element) {
//     var title = $(element).children('a').text().replace('Read More', '');
//     // in selected element. look for child element a-tags, save values with "href" attributes 
//     var link = $(element).children().attr("href");
//     // in selected element, look for child element p-tags with class for summary/gist & save the values
//     var summary = $(element).children('p.hide-for-small-only').text();
//     // var image = $(element).children().attr('img src');
    
//     // Save these results in an object that we'll push into the results array we defined earlier
//     results.push({
//       title: title,
//       summary: summary,
//       link: link
// });
//   // Log results with cheerio
//   console.log(results);
//   });
// });


