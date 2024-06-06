import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { addStream } from '../../store/streams/streams.actions';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';
import { createPeerConnection } from '../../utils/peerConnection';
import { socketConnection } from '../../utils/socketConnection';
import proSocketListeners from '../../utils/proSocketListener';

import { VideoComponent } from '../../components/VideoComponent/VideoComponent';

export const ProMainVideo = () => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const [searchParams] = useSearchParams();
  const [meetingInfo, setMeetingInfo] = useState({});
  const smallFeedEl = useRef(null);
  const largeFeedEl = useRef(null);
  const [haveGottenIce, setHaveGottenIce] = useState(false);
  const streamsRef = useRef(null);

  useEffect(() => {
    //fetch the user media
    const fetchMedia = async () => {
      const constraints = {
        video: true,
        audio: true,
      };
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        dispatch(updateCallStatus('haveMedia', true)); //update our callStatus reducer with media
        dispatch(addStream('localStream', stream)); //add local stream to reducer stream
        const { peerConnection, remoteStream } =
          await createPeerConnection(addIce);
        dispatch(addStream('remote1', remoteStream, peerConnection));

        // Set the video feed to be the remoteStream
        largeFeedEl.current.srcObject = remoteStream;
      } catch (err) {
        console.log(err);
      }
    };
    fetchMedia();
  }, []);

  useEffect(() => {
    const getIceAsync = async () => {
      const socket = socketConnection(searchParams.get('token'));
      const uuid = searchParams.get('uuid');
      const iceCandidates = await socket.emitWithAck(
        'getIce',
        uuid,
        'professional'
      );
      iceCandidates.forEach((iceCandidate) => {
        for (const s in streams) {
          if (s !== 'localStream') {
            const pc = streams[s].peerConnection;
            pc.addIceCandidate(iceCandidate);
          }
        }
      });
    };
    if (streams.remote1 && !haveGottenIce) {
      setHaveGottenIce(true);
      getIceAsync();
      streamsRef.current = streams; //update streamsRef
    }
  }, [streams, haveGottenIce]);

  useEffect(() => {
    const setAsyncOffer = async () => {
      for (const s in streams) {
        if (s !== 'localStream') {
          const pc = streams[s].peerConnection;
          await pc.setRemoteDescription(callStatus.offer);
        }
      }
    };
    if (
      callStatus.offer &&
      streams.remote1 &&
      streams.remote1.peerConnection
    ) {
      setAsyncOffer();
    }
  }, [callStatus.offer, streams.remote1]);

  useEffect(() => {
    const createAnswerAsync = async () => {
      // setLocalDescription if we have audio and video
      for (const s in streams) {
        if (s !== 'localStream') {
          const pc = streams[s].peerConnection;
          // make an answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          dispatch(updateCallStatus('haveCreatedAnswer', true));
          dispatch(updateCallStatus('answer', answer));
          // emit the answer to the server
          const token = searchParams.get('token');
          const socket = socketConnection(token);
          const uuid = searchParams.get('uuid');
          socket.emit('newAnswer', { answer, uuid });
        }
      }
    };
    if (
      callStatus.audio === 'enabled' &&
      callStatus.video === 'enabled' &&
      !callStatus.haveCreatedAnswer
    ) {
      createAnswerAsync();
    }
  }, [
    callStatus.audio,
    callStatus.video,
    callStatus.haveCreatedAnswer,
  ]);

  useEffect(() => {
    const token = searchParams.get('token');
    const fetchDecodedToken = async () => {
      const response = await axios.post(
        'https://api.mgan.xyz/validate-link',
        { token }
      );
      setMeetingInfo(response.data);
    };
    fetchDecodedToken();
  }, [searchParams]);

  useEffect(() => {
    //grab the token var out of the query string
    const token = searchParams.get('token');
    const socket = socketConnection(token);
    proSocketListeners.proVideoSocketListeners(
      socket,
      addIceCandidateToPeerConnection
    );
  }, []);

  const addIceCandidateToPeerConnection = (iceCandidate) => {
    //add an ice candidate from the remote, to the peer connection
    for (const s in streamsRef.current) {
      if (s !== 'localStream') {
        const pc = streamsRef.current[s].peerConnection;
        pc.addIceCandidate(iceCandidate);
      }
    }
  };

  const addIce = (iceCandidate) => {
    //emit ice candidate to the server
    const socket = socketConnection(searchParams.get('token'));
    socket.emit('iceToServer', {
      iceCandidate,
      who: 'professional',
      uuid: searchParams.get('uuid'),
    });
  };

  return (
    <VideoComponent
      largeFeedEl={largeFeedEl}
      smallFeedEl={smallFeedEl}
      isShowing={
        callStatus.audio === 'off' || callStatus.video === 'off'
      }
      pro={true}
      meetingInfo={meetingInfo}
    />
  );
};
