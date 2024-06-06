// express routes
const app = require('./server').app;
const jwt = require('jsonwebtoken');
const linkSecret = 'dsjkahdlsf5504ld';
const { v4: uuidv4 } = require('uuid');

// normally coming from database
const meetings = [
  {
    fullName: 'Sam Smith',
    meetingDate: Date.now() + 500000,
    uuid: 1,
    clientName: 'Jim Jones',
  },
  {
    fullName: 'Sam Smith',
    meetingDate: Date.now() - 2000000,
    uuid: 2,
    clientName: 'Akash Patel',
  },
  {
    fullName: 'Sam Smith',
    meetingDate: Date.now() + 10000000,
    uuid: 3,
    clientName: 'Mike Williams',
  },
];

app.set('meetings', meetings);

app.get('/user-link', (req, res) => {
  const userData = meetings[0];
  meetings.push(userData);
  // encode user data in a jwt token to append it to link- url
  const token = jwt.sign(userData, linkSecret);
  res.send('https://www.mgan.xyz/join-video?token=' + token);
});

app.post('/validate-link', (req, res) => {
  //get the token from the body of the post request
  const token = req.body.token;
  //decode the jwt with our secret
  const decodedData = jwt.verify(token, linkSecret);
  //send the decoded data  back to the front end
  res.json(decodedData);
});

app.get('/pro-link', (req, res) => {
  const userData = {
    fullName: 'Sam Smith',
    proId: 1234,
  };
  const token = jwt.sign(userData, linkSecret);
  res.send(
    `<a href="https://www.mgan.xyz/dashboard?token=${token}" target="_blank">Link Here</a>`
  );
});
