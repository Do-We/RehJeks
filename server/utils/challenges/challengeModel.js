var mongoose = require('mongoose');
var shortid = require('shortid');
mongoose.Promise = require('bluebird');

var challengeSchema = mongoose.Schema({
  id: String,
  userId: String,
  title: String,
  prompt: String,
  text: String,
  difficulty: String,
  expected: [String],
  answer: String,
  cheats: [String]
},
  {
    timestamps: true
  }); 

// Note: this only seems to generate IDs through the server, not our stub file.
// If you are going to add challenges in the stub file, make sure they have IDs.
challengeSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = shortid.generate();
  }
  next();
});

module.exports = mongoose.model('Challenge', challengeSchema);
 