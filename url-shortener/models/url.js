const mongoose = require('mongoose');
const { timeStamp } = require('node:console');
const { type } = require('node:os');

const urlschema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirecturl: {
      type: String,
      required: true,
    },
    visited: [{ timestamp: { type: Number } }],
  },
  { timestamp: true },
);

const URL = mongoose.model('URL', urlschema);

module.exports = URL;
