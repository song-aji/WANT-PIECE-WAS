# WANT-PIECE-WAS


실행할때 따라할것

sudo apt update \n
sudo apt install git \n
sudo apt install nodejs \n
sudo apt install npm \n
git clone https://github.com/leeSB096/WANT-PIECE-WAS \n
cd WANT-PIECE-WAS \n
npm install \n
nano .env \n
npm start \n


# 백그라운드 실행시
sudo npm install -g pm2 \n
pm2 start index.js

그뒤에 ec2 5000번 포트 열기 (보안그룹 인바운드 규칙설정)
