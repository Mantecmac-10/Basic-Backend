require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectMongo } = require('./connect');
const cookieParser = require('cookie-parser');

const userRoute = require('./routes/user');
const urlRoute = require('./routes/url');
const staticrouter = require('./routes/staticrouter');

const URL = require('./models/url');
const { restrictionofguest } = require('./middlewares/auth');

const app = express();
const PORT = 8001;

connectMongo(`${process.env.MONGODB_URL}/short-url`)
  .then(() => console.log('MongoDB Connected'))
  .catch((error) => console.error(error));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/user', userRoute);
app.use('/', staticrouter);
app.use('/url', restrictionofguest, urlRoute);

app.get('/url/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  try {
    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visited: {
            timestamp: Date.now(),
          },
        },
      },
    );

    if (!entry) {
      return res.json({ message: 'url not available' });
    }

    res.redirect(entry.redirecturl);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log('Server Started at Port 8001'));
