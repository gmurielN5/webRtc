import { io } from 'socket.io-client';

let socket;
export const socketConnection = (jwt) => {
  //check to see if the socket is already connected
  if (socket && socket.connected) {
    return socket;
  } else {
    socket = io.connect('https://localhost:443', {
      auth: {
        jwt,
      },
    });
    return socket;
  }
};
