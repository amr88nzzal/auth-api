'use strict';

const logger = (req, res, next) => {
  console.log('\u001b[' + 32 + 'm' + `================================`)
  console.log('►►►REQUEST:', req.method, req.path);
  console.log('\u001b[' + 32 + 'm' + `================================`)
  next();
};

module.exports = logger;
