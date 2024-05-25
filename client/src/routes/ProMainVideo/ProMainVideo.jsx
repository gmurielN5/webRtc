import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { addStream } from '../../store/streams/streams.actions';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';
import { createPeerConnection } from '../../utils/peerConnection';
import { socketConnection } from '../../utils/socketConnection';

import ChatWindow from '../../components/ChatWindow/ChatWindow';
import ActionButtons from '../../components/ActionButtons/ActionButtons';

export const ProMainVideo = () => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const [searchParams, setSearchParams] = useSearchParams();
  const [meetingInfo, setMeetingInfo] = useState({});
  const smallFeedEl = useRef(null);
  const largeFeedEl = useRef(null);
  // const [haveGottenIce, setHaveGottenIce] = useState(false);
  // const streamsRef = useRef(null);

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
  //    const getIceAsync = async () => {
  //      const socket = socketConnection(searchParams.get('token'));
  //      const uuid = searchParams.get('uuid');
  //      const iceCandidates = await socket.emitWithAck(
  //        'getIce',
  //        uuid,
  //        'professional'
  //      );
  //      console.log('iceCandidate Received');
  //      console.log(iceCandidates);
  //      iceCandidates.forEach((iceC) => {
  //        for (const s in streams) {
  //          if (s !== 'localStream') {
  //            const pc = streams[s].peerConnection;
  //            pc.addIceCandidate(iceC);
  //            console.log('=======Added Ice Candidate!!!!!!!');
  //          }
  //        }
  //      });
  //    };
  //    if (streams.remote1 && !haveGottenIce) {
  //      setHaveGottenIce(true);
  //      getIceAsync();
  //      streamsRef.current = streams; //update streamsRef once we know streams exists
  //    }
  //  }, [streams, haveGottenIce]);

  useEffect(() => {
    const setAsyncOffer = async () => {
      for (const s in streams) {
        if (s !== 'localStream') {
          const pc = streams[s].peerConnection;
          await pc.setRemoteDescription(callStatus.offer);
          console.log('have remote offer', pc.signalingstate);
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
      //we have audio and video, we can make an answer and setLocalDescription
      for (const s in streams) {
        if (s !== 'localStream') {
          const pc = streams[s].peerConnection;
          //make an answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log('have local answer', pc.signalingState);
          dispatch(updateCallStatus('haveCreatedAnswer', true));
          dispatch(updateCallStatus('answer', answer));
          //emit the answer to the server
          const token = searchParams.get('token');
          const socket = socketConnection(token);
          const uuid = searchParams.get('uuid');
          console.log('emitting', answer, uuid);
          socket.emit('newAnswer', { answer, uuid });
        }
      }
    };
    //we only create an answer if audio and video are enabled AND haveCreatedAnswer is false
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
    <div className="main-video-page">
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
        {callStatus.audio === 'off' || callStatus.video === 'off' ? (
          <div className="absolute w-96 top-1/3 right-1/3 bg-neutral-950 shadow-neutral-100 rounded p-6">
            <h1 className="text-gray-50 text-center">
              {searchParams.get('client')} is in the waiting room.
              <br />
              Call will start when video and audio are enabled
            </h1>
          </div>
        ) : null}
        <ChatWindow />
      </div>
      <ActionButtons
        smallFeedEl={smallFeedEl}
        largeFeedEl={largeFeedEl}
      />
    </div>
  );
};
