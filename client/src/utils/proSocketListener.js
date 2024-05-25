import { updateCallStatus } from '../store/callStatus/callStatus.actions';

const proDashabordSocketListeners = (
  socket,
  setMeetingInfo,
  dispatch
) => {
  socket.on('meetingData', (meetingInfo) => {
    console.log('on meetingData', meetingInfo);
    setMeetingInfo(meetingInfo);
  });

  socket.on('newOfferWaiting', (offerData) => {
    console.log('on new offer waiting', offerData);
    //   dispatch the offer to redux so that it is available for later
    dispatch(updateCallStatus('offer', offerData.offer));
    dispatch(updateCallStatus('myRole', 'answerer'));
  });
};

// const proVideoSocketListeners = (socket, addIceCandidateToPc) => {
//   socket.on('iceToClient', (iceC) => {
//     addIceCandidateToPc(iceC);
//   });
// };

export default {
  proDashabordSocketListeners,
  // proVideoSocketListeners,
};
