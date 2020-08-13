const express = require('express')
const apiRouter = express.Router()
const User = require('../models').User
const Course = require('../models').Course
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const {userValidationChain} = require('../validation/userValidation');
const {courseValidationChain} = require('../validation/courseValidation');
const {authenticationFunc} = require('../validation/authentication');

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
//API routes will be held here
apiRouter.get('/', asyncHandler(async(req, res) => {
  res.json({
    message: "Welcome to the API"
  })
}));

//GET users 200 - COPMLETE

apiRouter.get('/users', authenticationFunc, asyncHandler(async(req, res) => {
  const user = await User.findAll({
    attributes: ['id', 'firstName', 'lastName', 'emailAddress'], // filters out password, createdAt, and updatedAt
    where: {
      emailAddress: req.currentUser.emailAddress //displays only the logged in user
    }
  });
  res.json(user);
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
      res.status(201).location('/').end();
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
  const course = await Course.findAll({attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId']});
  res.json(course);
}));

//GET courses/:id 200 - completed

apiRouter.get('/courses/:id', asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
    include: [{
      model: User,
      as: 'user',
      attributes: ["id","firstName","lastName", "emailAddress"]
    }]
  });
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
        userId: req.currentUser.id //the authenticated user is set to the course owner
      })
      res.status(201).location(`/api/courses/${course.id}`).end()
    } catch(error) {
      res.status(400).json({
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
  if(course.userId !== req.currentUser.id) {
    res.status(403).json({message: "Forbidden: this isn't your course"})
  }
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
            userId: req.currentUser.id ////the authenticated user is only person allowed to edit the course, and shouldn't be able to reassign ownership of the course
          })
          res.status(204).json({
              message: "Thank you. The record was successfully updated."
          });
        } catch(error) {
          res.status(400).json({ 
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
  if(course.userId !== req.currentUser.id) {
    res.status(403).json({message: "Forbidden: this isn't your course"})
  }
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
