import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { addStream } from '../../store/streams/streams.actions';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';
import { createPeerConnection } from '../../utils/peerConnection';
import { socketConnection } from '../../utils/socketConnection';

import CallInfo from '../../components/CallInfo/CallInfo';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import ActionButtons from '../../components/ActionButtons/ActionButtons';

export const MainVideo = () => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const [searchParams, setSearchParams] = useSearchParams();
  const [meetingInfo, setMeetingInfo] = useState({});
  const smallFeedEl = useRef(null);
  const largeFeedEl = useRef(null);
  // const uuidRef = useRef(null);
  // const streamsRef = useRef(null);
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
        dispatch(updateCallStatus('haveMedia', true)); //update our callStatus reducer to know that we have the media
        dispatch(addStream('localStream', stream)); //add local stream to reducer stream
        const { peerConnection, remoteStream } =
          await createPeerConnection();
        dispatch(addStream('remote1', remoteStream, peerConnection));

        // Set the video feed to be the remoteStream
        // largeFeedEl.current.srcObject = remoteStream;
      } catch (err) {
        console.log(err);
      }
    };
    fetchMedia();
  }, [dispatch]);

  //  useEffect(() => {
  //    //we cannot update streamsRef until we know redux is finished
  //    if (streams.remote1) {
  //      streamsRef.current = streams;
  //    }
  //  }, [streams]);

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

  // useEffect(() => {
  //   const asyncAddAnswer = async () => {
  //     //listen for changes to callStatus.answer
  //     //if it exists, we have an answer!
  //     for (const s in streams) {
  //       if (s !== 'localStream') {
  //         const pc = streams[s].peerConnection;
  //         await pc.setRemoteDescription(callStatus.answer);
  //         console.log(pc.signalingState);
  //         console.log('Answer added!');
  //       }
  //     }
  //   };

  //   if (callStatus.answer) {
  //     asyncAddAnswer();
  //   }
  // }, [callStatus.answer]);

  useEffect(() => {
    const token = searchParams.get('token');
    const fetchDecodedToken = async () => {
      const response = await axios.post(
        'https://localhost:443/validate-link',
        { token }
      );
      setMeetingInfo(response.data);
      //  uuidRef.current = resp.data.uuid;
    };
    fetchDecodedToken();
  }, [searchParams]);

  // useEffect(() => {
  //   //grab the token var out of the query string
  //   const token = searchParams.get('token');
  //   const socket = socketConnection(token);
  //   clientSocketListeners(socket, dispatch, addIceCandidateToPc);
  // }, []);

  // const addIceCandidateToPc = (iceC) => {
  //   //add an ice candidate form the remote, to the pc
  //   for (const s in streamsRef.current) {
  //     if (s !== 'localStream') {
  //       const pc = streamsRef.current[s].peerConnection;
  //       pc.addIceCandidate(iceC);
  //       console.log(
  //         'Added an iceCandidate to existing page presence'
  //       );
  //       setShowCallInfo(false);
  //     }
  //   }
  // };

  // const addIce = (iceC) => {
  //   //emit a new icecandidate to the signalaing server
  //   const socket = socketConnection(searchParams.get('token'));
  //   socket.emit('iceToServer', {
  //     iceC,
  //     who: 'client',
  //     uuid: uuidRef.current, //we used a useRef to keep the value fresh
  //   });
  // };

  return (
    <div>
      <div className="relative overflow-hidden">
        <video
          className="bg-neutral-950 w-screen h-screen"
          ref={largeFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        <video
          className="absolute w-80 top-5 right-4 border-2 border-white rounded"
          ref={smallFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        {!showCallInfo ? null : (
          <CallInfo meetingInfo={meetingInfo} />
        )}
        <ChatWindow />
      </div>
      <ActionButtons
        smallFeedEl={smallFeedEl}
        largeFeedEl={largeFeedEl}
      />
    </div>
  );
};
