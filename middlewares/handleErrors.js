const { GeneralError } = require("../utils/errors");

const handleErrors = (err, req, res, next) => {
  if (!err) next();

  if (err instanceof GeneralError) {
    return res.status(err.getCode()).json({
      error: err.message,
    });
  }

  let errCode;
  let errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }

  return res.status(errCode).json({ error: errMessage });
};

module.exports = handleErrors;
