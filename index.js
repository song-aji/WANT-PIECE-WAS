const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const OpenAI = require("openai");

mongoose.connect('mongodb+srv://dark12319:bUGwSbjvtWHWFpFL@mokonix.nvcle.mongodb.net/?retryWrites=true&w=majority&appName=mokonix', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const app = express();
const port = 5000;

app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');

const openai = new OpenAI({
  apiKey: "실제 api키 들어갈곳",
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  try {
    const verified = jwt.verify(token, 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send('Invalid email or password');
  }

  const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
  res.send({ token });
});

async function getChatGPTResponse(message) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "대화 시, 겉으로는 무뚝뚝하고 차가운 말투를 사용해. 그러나 실제로는 상대방을 도와주고 싶어 하며, 본심이 드러나는 친절한 조언이나 설명을 덧붙여줘. 예를 들어, \"이걸 왜 물어봐? 뭐, 어쩔 수 없지, 도와줄게.\" 같은 식으로."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error interacting with ChatGPT API:", error);
    throw error;
  }
}

app.post('/chatbot', authenticateToken, async (req, res) => {
  const { message } = req.body;

  try {
    const botResponse = await getChatGPTResponse(message);
    res.send({ response: botResponse });
  } catch (error) {
    res.status(500).send({ message: 'Error interacting with ChatGPT API' });
  }
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});

