const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const OpenAI = require("openai");

<<<<<<< HEAD
=======
// MongoDB 연결 설정
>>>>>>> 9f9fb23 (update 0904)
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

<<<<<<< HEAD
const openai = new OpenAI({
});

=======
// OpenAI 설정
const openai = new OpenAI({
});

async function getChatGPTResponse(message, systemRole) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemRole || "대화 시, 겉으로는 무뚝뚝하고 차가운 말투를 사용해. 그러나 실제로는 상대방을 도와주고 싶어 하며, 본심이 드러나는 친절한 조언이나 설명을 덧붙여줘."
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

<<<<<<< HEAD
    return response.choices[0].message.content; 
=======
    return response.choices[0].message.content;  // ChatGPT의 응답 반환
>>>>>>> 9f9fb23 (update 0904)
  } catch (error) {
    console.error("Error interacting with ChatGPT API:", error);
    throw error;
  }
}

<<<<<<< HEAD
=======
// JWT 토큰 인증 함수
>>>>>>> 9f9fb23 (update 0904)
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

<<<<<<< HEAD
=======
// 기본 루트: index.html 파일 제공
>>>>>>> 9f9fb23 (update 0904)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

<<<<<<< HEAD
=======
// 사용자 등록 라우트
>>>>>>> 9f9fb23 (update 0904)
app.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

<<<<<<< HEAD
=======
// 로그인 라우트
>>>>>>> 9f9fb23 (update 0904)
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

<<<<<<< HEAD
=======
  // 로그인 성공 시, 사용자 이름과 토큰을 함께 반환
>>>>>>> 9f9fb23 (update 0904)
  res.send({ token, name: user.name });
});

// Chatbot 라우트
app.post('/chatbot', authenticateToken, async (req, res) => {
  const { message, systemRole } = req.body;

  try {
<<<<<<< HEAD
    const userId = req.user.id;
    const user = await User.findById(userId);

=======
    // 사용자의 ID를 통해 데이터를 가져옵니다.
    const userId = req.user.id;
    const user = await User.findById(userId);

    // 사용자가 새로운 systemRole을 설정한 경우 이를 저장합니다.
>>>>>>> 9f9fb23 (update 0904)
    if (systemRole) {
      user.systemRole = systemRole;
      await user.save();
    }

<<<<<<< HEAD
=======
    // systemRole이 없을 경우, 저장된 systemRole을 사용합니다.
>>>>>>> 9f9fb23 (update 0904)
    const botResponse = await getChatGPTResponse(message, user.systemRole);

    res.send({ response: botResponse });
  } catch (error) {
    res.status(500).send({ message: 'Error interacting with ChatGPT API' });
  }
});

<<<<<<< HEAD
=======
// 서버 실행
>>>>>>> 9f9fb23 (update 0904)
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});

