
var mongoose = require('mongoose');
var Challenge = require('./challengeModel');
var Solution = require('./../solutions/solutionModel');


//var localDb = 'mongodb://elliott:e@ds133378.mlab.com:33378/rehjeks_test';
// var deployedDb = 'mongodb://heroku_rhmw8v8m:ugiqvmqosj3ed5et4c2o3hh0or@ds127938.mlab.com:27938/heroku_rhmw8v8m';
// var devDb = 'mongodb://heroku_4jtklz9c:rp6b84vg6f1h0qhl7g1ajh9csj@ds127948.mlab.com:27948/heroku_4jtklz9c';

var db = mongoose.connect(mlabsTestDb);


// run this command in terminal from root directory to fetch data:   node server/utils/challenges/challengesStubs.js

// If you would like to add challenges, make sure they have IDs. If you add challenges through the website,
// it will generate unique IDs for you. Not so with the stub file, and that can cause problems.
var challengeArray = [
  {
    'id': '1',
    'title': 'Hex Color',
    'prompt': 'Match a hex color--only three or six characters!',
    'text': ' #rgf #abc #dks366 #f00 #BADA55 #C0FFEE #674 #3f9c',
    'difficulty': 'medium',
    'expected': ['#abc', '#f00', '#BADA55', '#C0FFEE', '#674'],
    'answer': '/#([a-f\d]{3}){1,2}/i',
    'cheats': ['']
  },
  {
    'id': '2',
    'title': 'Number',
    'prompt': 'Match a number without exponent or digit separators',
    'text': '-1 .05 +1000 3.1415926535 42.',
    'difficulty': 'hard',
    'expected': ['-1', '.05', '+1000', '3.1415926535', '42.'],
    'answer': '/^[-+]?(\d*\.?\d+|\d+\.)$/',
    'cheats': ['']
  },
  {
    'id': '3',
    'title': 'ISO 8601 Dates',
    'prompt': 'Match a date without time or timezone information',
    'text': '2012-12-12  Tue Dec 06 2016 14:19:04 GMT-0800 (PST) 1986-06-13',
    'difficulty': 'hard',
    'expected': ['2012-12-12', '1986-06-13'],
    'answer': '/\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])/',
    'cheats': ['']
  },
  { 
    'id': '4',
    'title': 'Intersection',
    'prompt': 'A 6+ letter password with at least: one number, one letter and a symbol',
    'text': '^orange9!',
    'difficulty': 'easy',
    'expected': ['^orange9!'],
    'answer': '/(?=.*\d)(?=.*[a-z])(?=.*[\W_]).{6,}/i',
    'cheats': ['']
  },
  {
    'id': '5',
    'title': 'Xan',
    'prompt': 'Match the first three strings, but not the last three strings.',
    'text': 'can man fan dan ran pan',
    'difficulty': 'easy',
    'expected': ['can', 'man', 'fan'],
    'answer': '/[cmf]an/gi',
    'cheats': ['']
  },
  {
    'id': '6',
    'title': 'Excluding specific characters',
    'prompt': 'Matches only the live animals (hog, dog, but not bog).',
    'text': 'hog dog bog',
    'difficulty': 'easy',
    'expected': ['hog', 'dog'],
    'answer': '/[^b]og/gi',
    'cheats': ['']
  },
  {
    'id': '7',
    'title': 'Subtraction',
    'prompt': 'Any number that\'s divisible by 50',
    'text': '50 40 100 150 201 500',
    'difficulty': 'medium',
    'expected': ['50', '100', '150', '500'],
    'answer': '/\b(?!\d+[50]0)\d+\b/',
    'cheats': ['']
  },
  {
    'id': '8',
    'title': 'Negation',
    'prompt': 'Anything that doesn\'t contain \'foo\'',
    'text': 'foo bar foo apple',
    'difficulty': 'medium',
    'expected': ['bar', 'apple'],
    'answer': '/^(?!.*foo).+$/gi',
    'cheats': ['']
  },
  {
    'id': '9',
    'title': 'Strings',
    'prompt': 'Find any kind of valid quote (including the quotation marks. Single quoted, double quoted, nested quoted, or with escaped quotes.',
    'text': '"foo", \'bar\', \'He said "hi"\', "He \'said\' \\"hi\\"","", \'\\\\\'',
    'difficulty': 'hard',
    'expected': ['"foo"', '\'bar\'', '\'He said "hi"\'', '"He \'said\' \\"hi\\""', '""', '\'\\\\\''],
    'answer': '/("|\')(\\\\?.)*?\\1/g',
    'cheats': ['']
  },
  {
    'id': '10',
    'title': 'Capitals',
    'prompt': 'Match the capital letters',
    'text': 'Match my Capital Letters! LoOk Ma, I\'m AnNoYiNg!',
    'difficulty': 'medium',
    'expected': ['M', 'C', 'L', 'L', 'O', 'M', 'I', 'A', 'N', 'Y', 'N'],
    'answer': '/[A-F]/gi',
    'cheats': ['']
  },
  {
    'id': '11',
    'title': 'Numerals',
    'prompt': 'Match the digits!',
    'text': 'A1B2C3D4E5',
    'difficulty': 'easy',
    'expected': ['1', '2', '3', '4', '5'],
    'answer': '/\\d/gi',
    'cheats': ['']
  },
  {
    'id': '12',
    'title': 'words',
    'prompt': 'Match entire words',
    'text': 'I have the best words.',
    'difficulty': 'medium',
    'expected': ['I', 'have', 'the', 'best', 'words'],
    'cheats': ['']
  },
  {
    'id': '13',
    'title': 'Date Format',
    'prompt': "Match a date that follows the following standard",
    'text':  'a023041s22b0011',
    'difficulty': 'medium',
    'expected': ['02:04'],
    'answer': '^([0-1][0-9]|[2][0-3]):([0-5][0-9])$',
    'cheats': ['']
  },
  {
    'id': '14',
    'title': 'Say Hello',
    'prompt': "Match the hidden word",
    'text':  '51h124e6-87l723-4l3.1.2o3',
    'difficulty': 'medium',
    'expected': ['h','e','l','l','o'],
    'answer': '[a-z]',
    'cheats': ['']
  },
  {
    'id': '15',
    'title': 'IPV4 Format without the dots',
    'prompt': "Match an IPv4 address",
    'text':  '12700112',
    'difficulty': 'easy',
    'expected': ['127001'],
    'answer': '/\\d{6}/gi',
    'cheats': ['']
  }
  

];


Challenge.remove({}, function(err, data) { return; });
Solution.remove({}, function(err, data) { return; });

Challenge.collection.insertMany(challengeArray, function(err, row) {
  if (err) {
    console.log(err);
  } else {
    console.log('challengeArray successfully stored. ');
  }
});

mongoose.connection.close();
