import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDevices } from '../../utils/getDevices';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';
import { addStream } from '../../store/streams/streams.actions';
import { startAudioStream } from '../../utils/startAudioStream';

import { Dropdown } from '../Dropdown/Dropdown';

import { FaCaretUp, FaMicrophone } from 'react-icons/fa6';

const AudioButton = ({ smallFeedEl }) => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const [isOpen, setIsOpen] = useState(false);
  const [audioDeviceList, setAudioDeviceList] = useState([]);

  let micText;
  if (callStatus.audio === 'off') {
    micText = 'Join Audio';
  } else if (callStatus.audio === 'enabled') {
    micText = 'Mute';
  } else {
    micText = 'Unmute';
  }

  useEffect(() => {
    const getDevicesAsync = async () => {
      if (isOpen) {
        const devices = await getDevices();
        setAudioDeviceList(
          devices.audioOutputDevices.concat(devices.audioInputDevices)
        );
      }
    };
    getDevicesAsync();
  }, [isOpen]);

  const startStopAudio = () => {
    // check if the audio is enabled, if so disabled
    if (callStatus.audio === 'enabled') {
      //update redux callStatus
      dispatch(updateCallStatus('audio', 'disabled'));
      //set the stream to disabled
      const tracks = streams.localStream.stream.getAudioTracks();
      tracks.forEach((t) => (t.enabled = false));
    } else if (callStatus.audio === 'disabled') {
      //update redux callStatus
      dispatch(updateCallStatus('audio', 'enabled'));
      const tracks = streams.localStream.stream.getAudioTracks();
      tracks.forEach((t) => (t.enabled = true));
    } else {
      changeAudioDevice({ target: { value: 'inputdefault' } });
      //add the tracks
      startAudioStream(streams);
    }
  };

  const changeAudioDevice = async (e) => {
    const deviceId = e.target.value.slice(5);
    const audioType = e.target.value.slice(0, 5);
    if (audioType === 'output') {
      // update the smallFeedEl
      smallFeedEl.current.setSinkId(deviceId);
    } else if (audioType === 'input') {
      // getUserMedia(permission);
      const newConstraints = {
        audio: { deviceId: { exact: deviceId } },
        video:
          callStatus.videoDevice === 'default'
            ? true
            : { deviceId: { exact: callStatus.videoDevice } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(
        newConstraints
      );
      //  update Redux with videoDevice
      dispatch(updateCallStatus('audioDevice', deviceId));
      dispatch(updateCallStatus('audio', 'enabled'));
      //  update the localStream in streams
      dispatch(addStream('localStream', stream));
      //  add tracks
      const [audioTrack] = stream.getAudioTracks();
      for (const s in streams) {
        if (s !== 'localStream') {
          const senders = streams[s].peerConnection.getSenders();
          const sender = senders.find((s) => {
            if (s.track) {
              return s.track.kind === audioTrack.kind;
            } else {
              return false;
            }
          });
          sender.replaceTrack(audioTrack);
        }
      }
    }
  };

  return (
    <div className="w-full h-full relative hover:bg-neutral-800 hover:cursor-pointer">
      <div
        className="w-full absolute top-1 right-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCaretUp color="#f9fafb" />
      </div>
      <div
        className="h-full flex flex-col justify-center items-center gap-y-2"
        onClick={startStopAudio}
      >
        <FaMicrophone size={24} color="#f9fafb" />
        <div className="text-gray-50 invisible md:visible">
          <p>{micText}</p>
        </div>
      </div>
      {isOpen && (
        <Dropdown
          defaultValue={callStatus.audioDevice}
          changeHandler={changeAudioDevice}
          deviceList={audioDeviceList}
          type="video"
        />
      )}
    </div>
  );
};

export default AudioButton;
