const { io } = require('socket.io-client');
const qr = require('qrcode-terminal');

const challengeApi = "https://api.release.heirloom.io/auth/sessions/challenges";
const apiKey = "A9d5BsugqyeNjxrVvthSfysPQ9DCRC5ugLY5obJtgaJd";

const webSocketUrl = "wss://api.release.heirloom.io/";

(async () => {
  const response = await fetch(challengeApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Heirloom-API-Key': apiKey,
      'X-Heirloom-API-Version': '1',
      'Content-Type': 'application/json',
    },
  });

  const responseBody = await response.json();

  const { loginChallenge, loginChallengeUrl } = responseBody;
  qr.setErrorLevel('L');
  qr.generate(loginChallengeUrl, { small: true });

  const topic = `tokens:${apiKey}:${loginChallenge}`;
  const socket = io(webSocketUrl, {
    transports: ['websocket'],
    query: {
      apiKey,
      jwtChallenge: loginChallenge,
    },
  });

  socket.on('connect', () => {
    console.log('Connected');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error)
  });

  socket.on('error', (error) => {
    console.error('Server error:', error)
  });

  socket.on(topic, (data) => {
    console.log('Received data:', data);

    socket.emit(`acknowledgement-${topic}`);
  });
})();
