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

const MainVideo = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [meetingInfo, setMeetingInfo] = useState({});
  const smallFeedEl = useRef(null);
  const largeFeedEl = useRef(null);

  useEffect(() => {
    //fetch the user media
    const fetchMedia = async () => {
      const constraints = {
        video: true,
        audio: false,
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

export default MainVideo;
