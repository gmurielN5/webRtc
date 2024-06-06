import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { addStream } from '../../store/streams/streams.actions';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';
import { createPeerConnection } from '../../utils/peerConnection';
import { socketConnection } from '../../utils/socketConnection';
import { clientSocketListeners } from '../../utils/clientSocketListeners';

import { VideoComponent } from '../../components/VideoComponent/VideoComponent';

export const MainVideo = () => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const [searchParams] = useSearchParams();
  const [meetingInfo, setMeetingInfo] = useState({});
  const smallFeedEl = useRef(null);
  const largeFeedEl = useRef(null);
  const uuidRef = useRef(null);
  const streamsRef = useRef(null);
  const [showCallInfo, setShowCallInfo] = useState(true);

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
  }, [dispatch]);

  useEffect(() => {
    const createOfferAsync = async () => {
      //we have audio and video and we need an offer. Let's make it!
      for (const s in streams) {
        if (s !== 'localStream') {
          try {
            const pc = streams[s].peerConnection;
            const offer = await pc.createOffer();
            pc.setLocalDescription(offer);
            //get the token from the url for the socket connection
            const token = searchParams.get('token');
            //get the socket from socketConnection
            const socket = socketConnection(token);
            socket.emit('newOffer', { offer, meetingInfo });
          } catch (err) {
            console.log(err);
          }
        }
      }
      dispatch(updateCallStatus('haveCreatedOffer', true));
    };
    if (
      callStatus.audio === 'enabled' &&
      callStatus.video === 'enabled' &&
      !callStatus.haveCreatedOffer
    ) {
      createOfferAsync();
    }
  }, [
    callStatus.audio,
    callStatus.video,
    callStatus.haveCreatedOffer,
  ]);

  useEffect(() => {
    const asyncAddAnswer = async () => {
      //listen for changes to callStatus.answer
      for (const s in streams) {
        if (s !== 'localStream') {
          const pc = streams[s].peerConnection;
          await pc.setRemoteDescription(callStatus.answer);
        }
      }
    };

    if (callStatus.answer) {
      asyncAddAnswer();
    }
  }, [callStatus.answer]);

  useEffect(() => {
    const token = searchParams.get('token');
    const fetchDecodedToken = async () => {
      const response = await axios.post(
        'https://localhost:9000/validate-link',
        { token }
      );
      setMeetingInfo(response.data);
      uuidRef.current = response.data.uuid;
    };
    fetchDecodedToken();
  }, [searchParams]);

  useEffect(() => {
    //grab the token var out of the query string
    const token = searchParams.get('token');
    const socket = socketConnection(token);
    clientSocketListeners(
      socket,
      dispatch,
      addIceCandidateToPeerConnection
    );
  }, []);

  useEffect(() => {
    // update streamsRef when redux is finished
    if (streams.remote1) {
      streamsRef.current = streams;
    }
  }, [streams]);

  const addIceCandidateToPeerConnection = (iceCandidate) => {
    //add an ice candidate from the remote to the peer connection
    for (const s in streamsRef.current) {
      if (s !== 'localStream') {
        const pc = streamsRef.current[s].peerConnection;
        pc.addIceCandidate(iceCandidate);
        setShowCallInfo(false);
      }
    }
  };

  const addIce = (iceCandidate) => {
    // emit a new icecandidate to the signaling server
    const socket = socketConnection(searchParams.get('token'));
    socket.emit('iceToServer', {
      iceCandidate,
      who: 'client',
      uuid: uuidRef.current,
    });
  };

  return (
    <VideoComponent
      largeFeedEl={largeFeedEl}
      smallFeedEl={smallFeedEl}
      isShowing={showCallInfo}
      meetingInfo={meetingInfo}
    />
  );
};
