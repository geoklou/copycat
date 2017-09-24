// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// Create a TitleSchema with the Schema class
var ArticleSchema = new Schema({
  // title: a unique String
  title: {
    type: String,
    unique: false
  },
  summary: {
    type: String,
    unique: false
  },
  link: {
    type: String,
    unique: false
  },
  saved: {
    type: Boolean,
    default: false
  },
  // notes property for the user
  notes: [{
    // Store ObjectIds in the array
    type: Schema.Types.ObjectId,
    // The ObjectIds will refer to the ids in the Note model
    ref: "Note"
  }]
});

// Create the User model with the UserSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the user model
module.exports = Article;