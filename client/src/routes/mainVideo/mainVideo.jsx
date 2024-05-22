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
  console.log(callStatus);

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

  useEffect(() => {
    const token = searchParams.get('token');
    const fetchDecodedToken = async () => {
      const response = await axios.post(
        'https://localhost:443/validate-link',
        { token }
      );
      console.log(response.data);
      setMeetingInfo(response.data);
      //  uuidRef.current = resp.data.uuid;
    };
    fetchDecodedToken();
  }, [searchParams]);

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
            //add our event listeners
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
        {meetingInfo.fullName && (
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
