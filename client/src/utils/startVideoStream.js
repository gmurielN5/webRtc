//this functions job is to update all peerConnections (addTracks) and update redux callStatus
import { updateCallStatus } from '../store/callStatus/callStatus.actions';

export const startLocalVideoStream = (streams, dispatch) => {
  const localStream = streams.localStream;
  for (const s in streams) {
    if (s !== 'localStream') {
      const curStream = streams[s];
      //addTracks to all peerConnecions
      localStream.stream.getVideoTracks().forEach((t) => {
        curStream.peerConnection.addTrack(
          t,
          streams.localStream.stream
        );
      });
      //update redux callStatus
      dispatch(updateCallStatus('video', 'enabled'));
    }
  }
};
