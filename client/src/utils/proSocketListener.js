import { updateCallStatus } from '../store/callStatus/callStatus.actions';

const proDashabordSocketListeners = (
  socket,
  setMeetingInfo,
  dispatch
) => {
  socket.on('meetingData', (meetingInfo) => {
    setMeetingInfo(meetingInfo);
  });

  socket.on('newOfferWaiting', (offerData) => {
    // dispatch the offer to redux
    dispatch(updateCallStatus('offer', offerData.offer));
    dispatch(updateCallStatus('myRole', 'answerer'));
  });
};

const proVideoSocketListeners = (
  socket,
  addIceCandidateToPeerConnection
) => {
  socket.on('iceToClient', (iceC) => {
    addIceCandidateToPeerConnection(iceC);
  });
};

export default {
  proDashabordSocketListeners,
  proVideoSocketListeners,
};
