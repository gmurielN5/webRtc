import { io } from 'socket.io-client';

export const socketConnection = io.connect('https://localhost:443');

// let socket;
// export const socketConnection = (jwt) => {
//   //check to see if the socket is already connected
//   if (socket && socket.connected) {
//     //if so, then just return it so whoever needs it, can use it
//     return socket;
//   } else {
//     //its not connected... connect!
//     socket = io.connect('https://localhost:443', {
//       auth: {
//         jwt,
//       },
//     });
//     return socket;
//   }
// };
