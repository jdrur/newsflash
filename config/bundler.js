var AlchemyAPI = require('./api/alchemyapi')
  , async      = require('async')
  , nytimes    = require('./newswire')
  , Promise    = require('bluebird')
  , seed       = require('./db/seed');

var alchemyapi = new AlchemyAPI();

var masterlist = {
    "children": []
  , "keywords": []
  , "mentions": 0
  , "name"    : "newsfeed"
  // , "size"    : 0
}

// initialize() returns a promise with the populated masterlist
exports.initialize = function() {
  return new Promise(function(resolve, reject) {

    // pullBreakingNews() returns a promise with the breaking news articles
    nytimes.pullBreakingNews().then(function(abstracts) {

      console.log('Analyzing ' + abstracts.length + ' abstracts with Alchemy...')

      async.map(abstracts, iterator, done);

      function iterator(item, callback) {
        alchemyapi.entities('text', item, {}, function(response) {

          // initialize each entity with masterlist
          response.entities.forEach(function(entity) {
            masterlist.children[masterlist.children.length] =
              {
                  "abstract": item
                , "children": []
                , "name": entity.text
                , "size": 0
              };
            // masterlist.size += 1;
            masterlist.keywords.push(entity.text);
          });

          // callback(null, masterlist); // throw TypeError
          callback(null, masterlist);
        });
      };

      function done(err, results) {
        if (err) {
          console.log("ERROR: ", err);
        } else {
          console.log("Resolving");
          console.log(masterlist);
          resolve(masterlist);
        }
      };

    });
  });
};
