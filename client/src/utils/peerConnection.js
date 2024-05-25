import peerConfiguration from './stunServers';

export const createPeerConnection = (addIce) => {
  return new Promise(async (resolve, reject) => {
    const peerConnection = await new RTCPeerConnection(
      peerConfiguration
    );
    const remoteStream = new MediaStream();
    peerConnection.addEventListener(
      'signalingstatechange',
      (e) => {}
    );
    peerConnection.addEventListener('icecandidate', (e) => {
      if (e.candidate) {
        addIce(e.candidate);
      }
    });
    peerConnection.addEventListener('track', (e) => {
      e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track, remoteStream);
      });
    });

    resolve({
      peerConnection,
      remoteStream,
    });
  });
};
