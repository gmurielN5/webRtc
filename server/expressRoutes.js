// express routes
const app = require('./server').app;
const jwt = require('jsonwebtoken');
const linkSecret = 'dsjkahdlsf5504ld';
const { v4: uuidv4 } = require('uuid');

const meetings = [];

app.set('meetings', meetings);

app.get('/user-link', (req, res) => {
  const uuid = uuidv4();
  //data for the end-user meeting
  const userData = {
    fullName: 'John Smith',
    date: Date.now() + 500000,
    uuid,
    clientName: 'Jack Jones',
  };
  meetings.push(userData);
  // encode user data in a jwt token to append it to link- url
  const token = jwt.sign(userData, linkSecret);
  res.send('https://localhost:5173/join-video?token=' + token);
});

app.post('/validate-link', (req, res) => {
  //get the token from the body of the post request
  const token = req.body.token;
  //decode the jwt with our secret
  const decodedData = jwt.verify(token, linkSecret);
  //send the decoded data  back to the front end
  res.json(decodedData);
});
