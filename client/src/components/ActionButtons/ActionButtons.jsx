import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import HangupButton from '../HangupButton/HangupButton';
// import socket from '../webRTCutilities/socketConnection';
// import VideoButton from './VideoButton/VideoButton';
// import AudioButton from './AudioButton/AudioButton';

import {
  FaComment,
  FaUsers,
  FaDesktop,
  FaCaretUp,
} from 'react-icons/fa';

import './actionsbuttons.css';

const ActionButtons = (
  {
    // openCloseChat,
    // smallFeedEl,
    // largeFeedEl,
  }
) => {
  const callStatus = useSelector((state) => state.callStatus);
  const menuButtons = useRef(null);

  useEffect(() => {
    let timer;
    const setTimer = () => {
      if (callStatus.current !== 'idle') {
        timer = setTimeout(() => {
          //move actions buttons if user been inactive for more than 4sec
          menuButtons.current.classList.add('hidden');
        }, 4000);
      }
    };

    window.addEventListener('mousemove', () => {
      if (
        menuButtons.current &&
        menuButtons.current.classList &&
        menuButtons.current.classList.contains('hidden')
      ) {
        menuButtons.current.classList.remove('hidden');
        setTimer();
      } else {
        // Not hidden, just reset start timer
        clearTimeout(timer);
        setTimer();
      }
    });
  }, [callStatus]);

  return (
    <div
      id="menu-buttons"
      ref={menuButtons}
      className="bg-neutral-900 absolute bottom-0 left-0 w-screen h-20 flex flex-row"
    >
      <div className="basis-1/4">
        {/* <AudioButton smallFeedEl={smallFeedEl} />
        <VideoButton smallFeedEl={smallFeedEl} /> */}
      </div>

      <div className="h-full basis-2/4 flex justify-center items-baseline gap-x-2">
        <div className="md:w-36">
          <div>
            <FaCaretUp color="#a3a3a3" />
          </div>
          <div className="flex flex-col justify-center items-center gap-y-2">
            <FaUsers size={24} color="#a3a3a3" />
            <div className="text-gray-400 invisible md:visible">
              <p>Participants</p>
            </div>
          </div>
        </div>
        <div className="md:w-36 flex flex-col justify-center items-center gap-y-2">
          <FaComment size={24} color="#a3a3a3" />
          <div className="text-gray-400 invisible md:visible">
            <p>Chat</p>
          </div>
        </div>
        <div className="md:w-36 flex flex-col justify-center items-center gap-y-2">
          <FaDesktop size={24} color="#a3a3a3" />
          <div className="text-gray-400 invisible md:visible">
            <p>Share Screen</p>
          </div>
        </div>
      </div>

      <div className="basis-1/4 flex justify-end items-center px-4">
        <HangupButton
        // smallFeedEl={smallFeedEl}
        // largeFeedEl={largeFeedEl}
        />
      </div>
    </div>
  );
};

export default ActionButtons;
