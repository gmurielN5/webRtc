import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { socketConnection } from '../../utils/socketConnection';

import HangupButton from '../HangupButton/HangupButton';
import VideoButton from '../VideoButton/VideoButton';
import AudioButton from '../AudioButton/AudioButton';

import {
  FaComment,
  FaUsers,
  FaDesktop,
  FaCaretUp,
} from 'react-icons/fa6';

const ActionButtons = ({
  // openCloseChat,
  smallFeedEl,
  // largeFeedEl,
}) => {
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
      <div className="basis-1/4 flex justify-around items-baseline px-2 md:px-4">
        <AudioButton smallFeedEl={smallFeedEl} />
        <VideoButton smallFeedEl={smallFeedEl} />
      </div>

      <div className="basis-2/4 flex justify-around items-baseline">
        <div className="w-full h-full relative hover:bg-neutral-800 hover:cursor-pointer">
          <div className="w-full absolute top-1 right-0">
            <FaCaretUp color="#a3a3a3" />
          </div>
          <div className="h-full flex flex-col justify-center items-center gap-y-2">
            <FaUsers size={24} color="#a3a3a3" />
            <div className="text-gray-400 invisible md:visible">
              <p>Participants</p>
            </div>
          </div>
        </div>
        <div className="w-full h-full flex flex-col justify-center items-center gap-y-2 hover:bg-neutral-800 hover:cursor-pointer">
          <FaComment size={24} color="#a3a3a3" />
          <div className="text-gray-400 invisible md:visible">
            <p>Chat</p>
          </div>
        </div>
        <div className="w-full h-full flex flex-col justify-center items-center gap-y-2 hover:bg-neutral-800 hover:cursor-pointer">
          <FaDesktop size={24} color="#a3a3a3" />
          <div className="text-gray-400 invisible md:visible">
            <p>Share Screen</p>
          </div>
        </div>
      </div>

      <div className="basis-1/4 flex justify-end items-center px-2 md:px-4">
        <HangupButton
        // smallFeedEl={smallFeedEl}
        // largeFeedEl={largeFeedEl}
        />
      </div>
    </div>
  );
};

export default ActionButtons;
