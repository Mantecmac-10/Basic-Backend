const { nanoid } = require('nanoid');

const URL = require('../models/url');

async function generateshorturl(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Url is required!' });
  const shortID = nanoid(8);

  await URL.create({
    shortId: shortID,
    redirecturl: url,
    visitHistory: [],
  });

  return res.render('home', { id: shortID });
}

async function handlegetanalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visited.length,
    analytics: result.visited,
  });
}

module.exports = { generateshorturl, handlegetanalytics };
