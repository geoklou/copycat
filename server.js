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

var port = process.env.PORT || 3000;
// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  // mongoose.connect(databaseUri);
  mongoose.connect("mongodb://localhost/copycat");
}

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

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
// console.log(newArticles);
    Article.insertMany(newArticles, function (error, docs) {
      console.log(error);
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

// Delete One from the DB // works but don't know why
// app.get("/articles/:id", function(req, res) {
//   // Remove article using the objectID
//   Article.deleteOne({"_id": req.params.id}, function(error, removed) {
//     // Log errors
//     if (error) {
//       console.log(error);
//       res.send(error);
//     }
//     else {
//       console.log(removed);
//       //return to homepage
//       // res.redirect("/");
//     }
//   });
// });

// Delete One from the DB
app.delete("/articless/:id", function(req, res) {
  // Remove article using the objectID
  var query = {"_id": req.params.id}; 
  Article.destroy(query, function(error, removed) {
    // Log errors
    if (error) {
      console.log(error);
      res.send(error);
    }
    else {
      console.log(removed);
      //return to homepage
      res.redirect("/saved");
      // res.render();
    }
  });
});

//button "save article" to save article
app.get("/api/articles/:id", function(req, res){
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

//save note
app.put("/articles/:id", function(req, res){
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
  if (error) {
    res.send(error);
  }
    else {
      Article.findOneAndUpdate({"_id": req.params.id},
        { $push: 
          {
            "notes": doc._id
          }
          }, 
        {new: true}, function(err, doc){
          if (err) {
            res.send(err);
        }
          else {
            // res.redirect('/');
            res.send(doc);
            console.log(doc);
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
      // console.log(found);
    }
  });
});


//Retrieve notes
app.get("/articles/notes", function(req, res) {
  // Find notes from db
  Article.find({"_id": Note.body}, function(error, doc) {
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

// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port 3000!");
});

//////////////
//for console test only
// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link from PC Magazine:" +
            "\n***********************************\n");

