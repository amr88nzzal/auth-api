'use strict';

function err404(req, res, next) {

  const errObject = {
    status: 404,
    message: 'The Page You Request Is Not Found'
  };

  res.status(404).json(errObject);
}

module.exports = err404;
