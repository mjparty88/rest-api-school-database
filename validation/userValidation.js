const { check, body, validationResult } = require('express-validator');

///middleware validation for the user resources (using express-validator)
exports.userValidationChain = [
  check('firstName')
    .exists({checkNull: true, checkFalsy: true}).withMessage("You must provide a first name for the user using the key firstName")
    .isAlpha().withMessage("firstName must be a string, with only alpha characters"),
  check('lastName')
    .exists({checkNull: true, checkFalsy: true}).withMessage("You must provide a last name for the user using the key lastName")
    .isAlpha().withMessage("lastName must be a string, with only alpha characters"),
  check('emailAddress')
    .exists({checkNull: true, checkFalsy: true}).withMessage("You must provide an email address for the user using the key emailAddress")
    .isEmail().withMessage("You must provide a valid email address"),
  check('password')
    .exists({checkNull: true, checkFalsy: true}).withMessage("You must provide a password for the user using the key password")
  ];
