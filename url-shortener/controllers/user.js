const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { setuser } = require('../services/auth');

async function handlesignup(req, res) {
  const { name, email, password } = req.body;
  await User.create({
    name,
    email,
    password,
  });
  return res.redirect('/login');
}

async function handlelogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user)
    return res.render('login', {
      error: 'Invalid Username or Password',
    });

  const token = setuser(user);
  res.cookie('uid', token);
  return res.redirect('/');
}

module.exports = {
  handlesignup,
  handlelogin,
};
