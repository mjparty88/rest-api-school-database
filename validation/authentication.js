const User = require('../models').User
const Course = require('../models').Course
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

//authentication middleware
exports.authenticationFunc = async function authenticateUser (req, res, next) {
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
