/* eslint-disable max-classes-per-file */
class GeneralError extends Error {
  constructor(message) {
    super();
    this.message = message;
  }
}

class BadRequest extends GeneralError {}
class NotFound extends GeneralError {}

GeneralError.prototype.getCode = function getCode() {
  if (this instanceof BadRequest) {
    return 400;
  }
  if (this instanceof NotFound) {
    return 404;
  }
  return 500;
};

module.exports = {
  GeneralError,
  BadRequest,
  NotFound,
};
