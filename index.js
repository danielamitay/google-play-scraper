const R = require('ramda');
const { constants } = require('./lib/constants.js');
const memoizee = require('memoizee');
const appMethod = require('./lib/app.js');

const list = require('./lib/list.js');
const search = require('./lib/search.js');
const suggest = require('./lib/suggest.js');
const developer = require('./lib/developer.js');
const reviews = require('./lib/reviews.js');
const similar = require('./lib/similar.js');
const permissions = require('./lib/permissions.js');
const datasafety = require('./lib/datasafety.js');
const categories = require('./lib/categories.js');

const methods = {
  app: appMethod,
  list,
  search: R.partial(search, [appMethod]),
  suggest,
  developer,
  reviews,
  similar,
  permissions,
  datasafety,
  categories
};

function memoized (opts) {
  const cacheOpts = Object.assign({
    primitive: true,
    normalizer: JSON.stringify,
    maxAge: 1000 * 60 * 5, // cache for 5 minutes
    max: 1000 // save up to 1k results to avoid memory issues
  }, opts);

  // need to rebuild the methods so they all share the same memoized appMethod
  const doMemoize = (fn) => memoizee(fn, cacheOpts);
  const mAppMethod = memoizee(appMethod, cacheOpts);

  const otherMethods = {
    list,
    search: R.partial(search, [mAppMethod]),
    suggest,
    developer,
    reviews,
    similar,
    permissions,
    datasafety,
    categories
  };

  return Object.assign({ app: mAppMethod },
    constants,
    R.map(doMemoize, otherMethods));
}

module.exports = {
  memoized,
  constants,
  methods
};
