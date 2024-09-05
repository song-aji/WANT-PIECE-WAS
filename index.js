const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const dotenv = require('dotenv');
const OpenAI = require("openai");

// 환경 변수 로드
dotenv.config();

// MongoDB 연결 설정
mongoose.connect(process.env.MONGO_URI, {
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

// OpenAI 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // 환경 변수로부터 API 키를 가져옴
});

// ChatGPT API와 상호작용하는 함수
async function getChatGPTResponse(message, systemRole) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemRole || "You are a helpful assistant."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 1,
      max_tokens: 256,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error interacting with ChatGPT API:", error);
    throw error;
  }
}

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};

// 기본 루트: index.html 파일 제공
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 사용자 등록 라우트
app.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// 사용자 목록 조회 라우트 (GET /users)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // 모든 사용자 가져오기
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching users' });
  }
});

// 로그인 라우트
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

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.send({ token, name: user.name });
});

// Chatbot 라우트
app.post('/chatbot', authenticateToken, async (req, res) => {
  const { message, systemRole } = req.body;

  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (systemRole) {
      user.systemRole = systemRole;
      await user.save();
    }

    const botResponse = await getChatGPTResponse(message, user.systemRole);

    res.send({ response: botResponse });
  } catch (error) {
    res.status(500).send({ message: 'Error interacting with ChatGPT API' });
  }
});

// 서버 실행
app.listen(port, '0.0.0.0', () => {
  console.log(`App running on http://localhost:${port}`);
});

