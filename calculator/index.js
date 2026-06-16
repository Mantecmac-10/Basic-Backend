import express from 'express';
import cors from "cors"
const app = express();

app.use(express.json());
app.use(cors())

const PORT = 8001;

app.get('/', function (req, res) {
  res.sendFile('/Users/Administrator/Desktop/backend/calculator/index.html');
});

app.get('/sum', (req, res) => {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  res.json({ sum: a + b });
});

app.get('/sub/:a/:b', (req, res) => {
  const a = parseInt(req.params.a);
  const b = parseInt(req.params.b);
  res.json({ diff: a - b });
});

app.post('/multi', (req, res) => {
  const a = req.body.a;
  const b = req.body.b;
  res.json({ product: a * b });
});

app.post('/div', (req, res) => {
  const { a, b } = req.body;
  res.json({ division: a / b });
});

app.listen(PORT, () => console.log('Server Started at Port 8001'));
