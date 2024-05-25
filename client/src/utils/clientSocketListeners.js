import { updateCallStatus } from '../store/callStatus/callStatus.actions';

export const clientSocketListeners = (
  socket,
  dispatch,
  addIceCandidateToPeerConnection
) => {
  socket.on('answerToClient', (answer) => {
    dispatch(updateCallStatus('answer', answer));
    dispatch(updateCallStatus('myRole', 'offerer'));
  });

  socket.on('iceToClient', (iceCandidate) => {
    addIceCandidateToPeerConnection(iceCandidate);
  });
};
