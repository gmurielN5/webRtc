import React from 'react';

import ActionButtons from '../ActionButtons/ActionButtons';
import CallInfo from '../CallInfo/CallInfo';
import ChatWindow from '../ChatWindow/ChatWindow';

export const VideoComponent = ({
  largeFeedEl,
  smallFeedEl,
  pro,
  isShowing,
  meetingInfo,
}) => {
  return (
    <div className="relative overflow-hidden w-screen h-screen">
      <video
        className="w-screen h-screen bg-gray-900"
        ref={largeFeedEl}
        autoPlay
        controls
        playsInline
      ></video>
      <video
        className="absolute max-w-80 top-5 right-4 border-2 border-white rounded"
        ref={smallFeedEl}
        autoPlay
        controls
        playsInline
      ></video>
      {!isShowing ? null : (
        <CallInfo pro={pro} meetingInfo={meetingInfo} />
      )}
      <ChatWindow />
      <ActionButtons
        smallFeedEl={smallFeedEl}
        largeFeedEl={largeFeedEl}
      />
    </div>
  );
};
