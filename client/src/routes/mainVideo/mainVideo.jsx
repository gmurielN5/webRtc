import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import CallInfo from '../../components/CallInfo/CallInfo';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import ActionButtons from '../../components/ActionButtons/ActionButtons';

const MainVideo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [meetingInfo, setMeetingInfo] = useState({});

  useEffect(() => {
    const token = searchParams.get('token');
    const fetchDecodedToken = async () => {
      const response = await axios.post(
        'https://localhost:443/validate-link',
        { token }
      );
      setMeetingInfo(response.data);
      console.log(response.data);
      //  uuidRef.current = resp.data.uuid;
    };
    fetchDecodedToken();
  }, [searchParams]);

  return (
    <div className="main-video-page">
      <div className="relative overflow-hidden">
        <video
          className="bg-neutral-950 w-screen h-screen"
          // ref={largeFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        <video
          className="absolute w-80 top-5 right-4 border-2 border-white rounded"
          // ref={smallFeedEl}
          autoPlay
          controls
          playsInline
        ></video>
        {meetingInfo.fullName && (
          <CallInfo meetingInfo={meetingInfo} />
        )}
        <ChatWindow />
      </div>
      <ActionButtons />
    </div>
  );
};

export default MainVideo;
