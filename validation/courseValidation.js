const { check, body, validationResult } = require('express-validator');

//middleware validation for the course resources (using express-validator)
exports.courseValidationChain = [
  check('title')
    .exists({checkNull: true, checkFalsy: true}).withMessage("You must provide a title for the course with the key title")
    .isString().withMessage("The title must be a string"), //isAlpha doesn't work here because spaces should be allowed
  check('description')
    .exists({checkNull: true, checkFalsy: true}).withMessage("You must provide a description for the course with the key description")
    .isString().withMessage("The description must be a string (it is a text field)"), //isAlpha doesn't work here because spaces should be allowed
  body('estimatedTime')
    .if(body('estimatedTime').exists()) //only validate the estimatedTime field if its been included in the request body
    .isString().withMessage("If you provide information for estimatedTime, it should be in string format"),
  body('materialsNeeded')
    .if(body('materialsNeeded').exists()) //only validate the materialsNeeded field if its been included in the request body
    .isString().withMessage("If you provide information about the materialsNeeded, it should be in string format"),
  check('userId') //note, I don't need to explicitly check the foreignKey constraint, because the Sequelize model captures it.
    .exists({checkNull: true, checkFalsy: true}).withMessage("You must provide the id of the user this course belongs to")
    .isInt({ allow_leading_zeroes: false }).withMessage("You must provide a valid userId")
];
