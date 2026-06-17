import "dotenv/config"
import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { auth } from './middleware.js';
const secret = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8001;

const notes = [];
const users = [
  {
    username: 'mann',
    password: '123123',
  },
];

app.post('/signup', function (req, res) {
  const username = req.body.username; // harkirat
  const password = req.body.password;
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(403).json({
      message: 'User with this username already exists',
    });
  }

  users.push({
    username: username,
    password: password,
  });

  res.json({
    message: 'You have signed up',
  });
});

app.post('/signin', function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const userExists = users.find(
    (user) => user.username === username && user.password === password,
  );

  if (!userExists) {
    res.status(403).json({
      message: 'Incorrect credentials',
    });
    return;
  }

  const token = jwt.sign(
    {
      username: username,
    },
    secret,
  );

  res.json({
    token: token,
  });
});

app.post('/notes', auth, function (req, res) {
  const note = req.body.note;
  notes.push(note);

  res.json({ message: 'Done!' });
});

app.get('/notes', auth, function (req, res) {
  res.json({ notes });
});

app.get('/signup', function (req, res) {
  res.sendFile(
    '/Users/Administrator/Desktop/backend/notesapp/frontend/signup.html',
  );
});

app.get('/signin', function (req, res) {
  res.sendFile(
    '/Users/Administrator/Desktop/backend/notesapp/frontend/signin.html',
  );
});

app.get('/', function (req, res) {
  res.sendFile(
    '/Users/Administrator/Desktop/backend/notesapp/frontend/index.html',
  );
});

app.listen(PORT, () => console.log('Server Started at 8001'));
