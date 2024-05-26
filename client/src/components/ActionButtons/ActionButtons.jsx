import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

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
  largeFeedEl,
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
      ref={menuButtons}
      className="bg-gray-900 absolute bottom-0 left-0 w-screen h-auto flex justify-between md:gap-4"
    >
      <div className="flex gap-2 px-4 justify-center">
        <AudioButton smallFeedEl={smallFeedEl} />
        <VideoButton smallFeedEl={smallFeedEl} />
      </div>

      <div className="md:w-3/4 flex gap-2 px-4 justify-center">
        <div className="relative flex md:w-36 hover:bg-gray-800 hover:cursor-pointer p-2">
          <div className="absolute top-1 right-1">
            <FaCaretUp color="#f9fafb" />
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            <FaUsers size={24} color="#f9fafb" />
            <div className="text-gray-50 hidden md:block">
              <p>Participants</p>
            </div>
          </div>
        </div>
        <div className="md:w-36 flex flex-col justify-center items-center gap-2 hover:bg-gray-800 hover:cursor-pointer p-2">
          <FaComment size={24} color="#f9fafb" />
          <div className="text-gray-50 hidden md:block">
            <p>Chat</p>
          </div>
        </div>
        <div className="md:w-36 flex flex-col justify-center items-center gap-2 hover:bg-gray-800 hover:cursor-pointer p-2">
          <FaDesktop size={24} color="#f9fafb" />
          <div className="text-gray-50 hidden md:block">
            <p>Share Screen</p>
          </div>
        </div>
      </div>
      <HangupButton
        smallFeedEl={smallFeedEl}
        largeFeedEl={largeFeedEl}
      />
    </div>
  );
};

export default ActionButtons;
