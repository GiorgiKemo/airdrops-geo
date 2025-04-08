const { dropViewsIndex } = require('./scripts/dropViewsIndex');

dropViewsIndex()
  .then(() => console.log('Index fix completed'))
  .catch(err => console.error('Index fix failed:', err));
