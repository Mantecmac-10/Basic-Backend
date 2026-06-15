const { getuser } = require('../services/auth');

async function restrictionofguest(req, res, next) {
  const userUid = req.cookies?.uid;

  if (!userUid) return res.redirect('/signup');
  const user = getuser(userUid);

  if (!user) return res.redirect('/login');

  req.user = user;
  next();
}

module.exports = {
  restrictionofguest,
};
