const express = require('express')
const apiRouter = express.Router()
const { check, body, validationResult } = require('express-validator');
const User = require('../models').User
const Course = require('../models').Course
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).json({
        message: "Sorry, there was an error",
        name: error.name,
        description: error.message
      });
    }
  }
}

//authentication middleware
const authenticationFunc = async function authenticateUser (req, res, next) {
  const credentials = auth(req); // Parse the user's credentials from the Authorization header.
  if (credentials) { // If the user's credentials are available...
    const users = await User.findAll({attributes: ['id','emailAddress', 'password']});
    const matchedUser = users.find(user => user.emailAddress === credentials.name); // Attempt to retrieve the user from the data store by their username (i.e. the user's "key" from the Authorization header).
    if (matchedUser) { // If a user was successfully retrieved from the data store...
      const authenticated = bcryptjs.compareSync(credentials.pass, matchedUser.password); //use bycrypt to compare the password from the auth header, against the matched users' password
      if (authenticated) { // If the passwords match...
        console.log(`Authentication successful for username: ${matchedUser.emailAddress}`);
        req.currentUser = matchedUser; //add the user's details to the request object
        next();
      } else {
        res.status(403).json({
          message: "Forbidden: The password did not match the user credential."
        })
      }
    } else {
      res.status(403).json({
        message: "Forbidden: No user matches the credential provided."
      })
    }
  } else {
    res.status(401).json({
      message: "Unauthorized: No credentials provided in the WWW-authenticate header."
    })
  }
}

//middleware validation for the user resources (using express-validator)
const userValidationChain = [
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

//middleware validation for the course resources (using express-validator)
const courseValidationChain = [
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


//API routes will be held here
apiRouter.get('/', asyncHandler(async(req, res) => {
  res.json({
    message: "Welcome to the API"
  })
}));

//GET users 200 - COPMLETE

apiRouter.get('/users', authenticationFunc, asyncHandler(async(req, res) => {
  const users = await User.findAll({attributes: ['id', 'firstName', 'lastName', 'emailAddress']}); // filters out password, createdAt, and updatedAt
  res.json(users);
}));

//POST users 201 - completed

apiRouter.post('/users', userValidationChain, asyncHandler(async(req, res) => {
  const errors = validationResult(req);
  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);
    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
    try {
      user = await User.create({
        id: null,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAddress: req.body.emailAddress,
        password: bcryptjs.hashSync(req.body.password)
      })
      res.status(201).json({ message: "Successfully created new user."})
    } catch(error) {
        res.status(500).json({
          message: "Sorry, there was an error",
          name: error.name,
          description: error.message
        });
      }
    }
}));

//GET courses 200 - completed

apiRouter.get('/courses', asyncHandler(async(req, res) => {
  const course = await Course.findAll();
  res.json(course);
}));

//GET courses/:id 200 - completed

apiRouter.get('/courses/:id', asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id);
  if(course) {
    res.json(course);
  } else {
    res.status(404).json({message: "There are no courses with that id."});
  }
}));

//POST course 201 - complete

apiRouter.post('/courses', authenticationFunc, courseValidationChain, asyncHandler(async(req, res) => {
  const errors = validationResult(req);
  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
        const errorMessages = errors.array().map(error => error.msg);
    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
    try {
      //create to the courses database
      course = await Course.create({
        id: null,
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        userId: req.body.userId
      })
      res.status(201).json({ message: "Successfully created course" })
    } catch(error) {
      res.status(500).json({
        message:"Sorry, there was an error",
        name: error.name,
        description: error.message
      });
    }
  }
}));

//PUT courses/:id 204 - completed

apiRouter.put('/courses/:id', authenticationFunc, courseValidationChain, asyncHandler(async(req, res) => {
  const errors = validationResult(req);
  const course = await Course.findByPk(req.params.id);
  if(course) {
    if(!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
          const errorMessages = errors.array().map(error => error.msg);
      // Return the validation errors to the client.
      res.status(400).json({ errors: errorMessages });
    } else {
        try {
          await course.update({
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded,
            userId: req.body.userId
          })
          res.status(204).json({
              message: "Thank you. The record was successfully updated."
          });
        } catch(error) {
          res.status(500).json({
          message: "Sorry, there was an error",
          name: error.name,
          description: error.message
        })
      }
    }
  } else {
      res.status(404).json({message: "There are no courses with that id."})
  }
}));

//DELETE courses/:id 204 - completed

apiRouter.delete('/courses/:id', authenticationFunc, asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id);
  if(course){
    try {
      await course.destroy();
      res.status(204).json({
        message: "The record was deleted."
      })
    } catch(error) {
      res.status(500).json({
        message: "Sorry, there was an error",
        name: error.name,
        description: error.message
      })
    }
  } else {
    res.status(404).json({
      message: "That course id does not exist."
    })
  }
}));

module.exports = apiRouter;
