//all our socketServer stuff happens here
const io = require('./server').io;
const app = require('./server').app;

const linkSecret = 'dsjkahdlsf5504ld';
const jwt = require('jsonwebtoken');

const connectedProfessionals = [];
const connectedClients = [];

const allKnownOffers = {
  // uniqueId - key
  // offer
  // fullName
  // clientName
  //date
  //offererIceCandidates
  //answer
  //answerIceCandidates
};

io.on('connection', (socket) => {
  const handshakeData = socket.handshake.auth.jwt;
  let decodedData;
  try {
    decodedData = jwt.verify(handshakeData, linkSecret);
  } catch (err) {
    socket.disconnect();
    return;
  }
  const { fullName, proId } = decodedData;
  if (proId) {
    // professional
    // check reconnection of same user
    const connectedPro = connectedProfessionals.find(
      (cp) => cp.proId === proId
    );
    if (connectedPro) {
      connectedPro.socketId = socket.id;
    } else {
      connectedProfessionals.push({
        socketId: socket.id,
        fullName,
        proId,
      });
    }
    const appointments = app.get('meetings');
    socket.emit(
      'meetingData',
      appointments.filter((pa) => pa.fullName === fullName)
    );
    //loop through all known offers and send out to the professional that just joined,
    for (const key in allKnownOffers) {
      if (allKnownOffers[key].fullName === fullName) {
        // sending to pro user  only
        io.to(socket.id).emit('newOfferWaiting', allKnownOffers[key]);
      }
    }
  } else {
    // client
    const { fullName, uuid, clientName } = decodedData;
    // check reconnection of same user
    const clientExist = connectedClients.find((c) => c.uuid == uuid);
    if (clientExist) {
      //already connected. update the id
      clientExist.socketId = socket.id;
    } else {
      //   //add them
      connectedClients.push({
        clientName,
        uuid,
        professionalMeetingWith: fullName,
        socketId: socket.id,
      });
    }

    const offerForThisClient = allKnownOffers[uuid];
    if (offerForThisClient) {
      io.to(socket.id).emit(
        'answerToClient',
        offerForThisClient.answer
      );
    }
  }

  socket.on('newAnswer', ({ answer, uuid }) => {
    //emit this to the client
    const socketToSendTo = connectedClients.find(
      (c) => c.uuid == uuid
    );
    if (socketToSendTo) {
      socket
        .to(socketToSendTo.socketId)
        .emit('answerToClient', answer);
    }
    //update the offer
    const knownOffer = allKnownOffers[uuid];
    if (knownOffer) {
      knownOffer.answer = answer;
    }
  });

  socket.on('newOffer', ({ offer, meetingInfo }) => {
    //offer = sdp/type, meetingInfo has the uuid that we can add to allKnownOffers
    allKnownOffers[meetingInfo.uuid] = {
      ...meetingInfo,
      offer,
      offererIceCandidates: [],
      answer: null,
      answerIceCandidates: [],
    };
    //we dont emit this to everyone like we did our chat server
    //we only want this to go to our professional.

    //we got professionalAppointments from express (thats where its made)
    const appointments = app.get('meetings');
    //find this particular appt so we can update that the user is waiting (has sent us an offer)
    const pa = appointments.find(
      (pa) => pa.uuid === meetingInfo.uuid
    );
    if (pa) {
      pa.waiting = true;
    }

    //find this particular professional so we can emit
    const p = connectedProfessionals.find(
      (cp) => cp.fullName === meetingInfo.fullName
    );
    if (p) {
      //only emit if the professional is connected
      const socketId = p.socketId;
      //send the new offer over
      socket
        .to(socketId)
        .emit('newOfferWaiting', allKnownOffers[meetingInfo.uuid]);
      //send the updated meeting info with the new waiting
      socket.to(socketId).emit(
        'meetingData',
        appointments.filter(
          (pa) => pa.fullName === meetingInfo.fullName
        )
      );
    }
  });

  socket.on('getIce', (uuid, who, ackFunc) => {
    const offer = allKnownOffers[uuid];
    let iceCandidates = [];
    if (offer) {
      if (who === 'professional') {
        iceCandidates = offer.offererIceCandidates;
      } else if (who === 'client') {
        iceCandidates = offer.answerIceCandidates;
      }
      ackFunc(iceCandidates);
    }
  });

  socket.on('iceToServer', ({ who, iceCandidate, uuid }) => {
    const offerToUpdate = allKnownOffers[uuid];
    if (offerToUpdate) {
      if (who === 'client') {
        offerToUpdate.offererIceCandidates.push(iceCandidate);
        const socketToSendTo = connectedProfessionals.find(
          (cp) => cp.fullName === decodedData.fullName
        );
        if (socketToSendTo) {
          socket
            .to(socketToSendTo.socketId)
            .emit('iceToClient', iceCandidate);
        }
      } else if (who === 'professional') {
        offerToUpdate.answerIceCandidates.push(iceCandidate);
        const socketToSendTo = connectedClients.find(
          (cp) => cp.uuid == uuid
        );
        if (socketToSendTo) {
          socket
            .to(socketToSendTo.socketId)
            .emit('iceToClient', iceCandidate);
        }
      }
    }
  });
});
