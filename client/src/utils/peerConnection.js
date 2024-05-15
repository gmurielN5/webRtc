import peerConfiguration from './stunServers';

export const createPeerConnection = (addIce) => {
  return new Promise(async (resolve, reject) => {
    const peerConnection = await new RTCPeerConnection(
      peerConfiguration
    );
    const remoteStream = new MediaStream();
    peerConnection.addEventListener('signalingstatechange', (e) => {
      console.log('Signaling State Change');
      console.log(e);
    });
    peerConnection.addEventListener('icecandidate', (e) => {
      console.log('Found ice candidate...', e);
      if (e.candidate) {
        // addIce(e.candidate);
      }
    });
    // peerConnection.addEventListener('track', (e) => {
    //   console.log('Got a track from the remote!');
    //   e.streams[0].getTracks().forEach((track) => {
    //     remoteStream.addTrack(track, remoteStream);
    //     console.log('Fingers crossed...');
    //   });
    // });

    resolve({
      peerConnection,
      remoteStream,
    });
  });
};
