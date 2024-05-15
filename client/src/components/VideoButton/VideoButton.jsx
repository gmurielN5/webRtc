import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startLocalVideoStream } from '../../utils/startVideoStream';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';
import { addStream } from '../../store/streams/streams.actions';
import { getDevices } from '../../utils/getDevices';
import { Dropdown } from '../Dropdown/Dropdown';
import { FaCaretUp, FaVideo } from 'react-icons/fa';

const VideoButton = ({ smallFeedEl }) => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [videoDeviceList, setVideoDeviceList] = useState([]);

  useEffect(() => {
    const getDevicesAsync = async () => {
      if (isOpen) {
        const devices = await getDevices();
        setVideoDeviceList(devices.videoDevices);
      }
    };
    getDevicesAsync();
  }, [isOpen]);

  const changeVideoDevice = async (e) => {
    const deviceId = e.target.value;
    // getUserMedia (permission)
    const newConstraints = {
      audio:
        callStatus.audioDevice === 'default'
          ? true
          : { deviceId: { exact: callStatus.audioDevice } },
      video: { deviceId: { exact: deviceId } },
    };
    const stream = await navigator.mediaDevices.getUserMedia(
      newConstraints
    );
    // update Redux with that videoDevice, and that video is enabled
    dispatch(updateCallStatus('videoDevice', deviceId));
    dispatch(updateCallStatus('video', 'enabled'));
    // update the smallFeedEl
    smallFeedEl.current.srcObject = stream;
    // update the localStream in streams
    dispatch(addStream('localStream', stream));
    // add tracks
    const tracks = stream.getVideoTracks();

    // const [videoTrack] = stream.getVideoTracks();
    //   //come back to this later
    //   //if we stop the old tracks, and add the new tracks, that will mean
    //   // ... renegotiation
    //   for (const s in streams) {
    //     if (s !== 'localStream') {
    //       //getSenders will grab all the RTCRtpSenders that the PC has
    //       //RTCRtpSender manages how tracks are sent via the PC
    //       const senders = streams[s].peerConnection.getSenders();
    //       //find the sender that is in charge of the video track
    //       const sender = senders.find((s) => {
    //         if (s.track) {
    //           //if this track matches the videoTrack kind, return it
    //           return s.track.kind === videoTrack.kind;
    //         } else {
    //           return false;
    //         }
    //       });
    //       //sender is RTCRtpSender, so it can replace the track
    //       sender.replaceTrack(videoTrack);
    //     }
    //   }
  };

  const startStopVideo = () => {
    //first, check if the video is enabled, if so disabled
    if (callStatus.video === 'enabled') {
      console.log('media enable');
      //   //update redux callStatus
      //   dispatch(updateCallStatus('video', 'disabled'));
      //   //set the stream to disabled
      //   const tracks = streams.localStream.stream.getVideoTracks();
      //   tracks.forEach((t) => (t.enabled = false));
    } else if (callStatus.video === 'disabled') {
      console.log('media disable');

      //   //second, check if the video is disabled, if so enable
      //   //update redux callStatus
      //   dispatch(updateCallStatus('video', 'enabled'));
      //   const tracks = streams.localStream.stream.getVideoTracks();
      //   tracks.forEach((t) => (t.enabled = true));
    } else if (callStatus.haveMedia) {
      console.log('have media');
      smallFeedEl.current.srcObject = streams.localStream.stream;
      //add tracks to the peerConnections
      startLocalVideoStream(streams, dispatch);
    } else {
      setPendingUpdate(true);
    }
  };

  useEffect(() => {
    if (pendingUpdate && callStatus.haveMedia) {
      console.log('is pending looking for video feed');
      smallFeedEl.current.srcObject = streams.localStream.stream;
      setPendingUpdate(false);
      // startLocalVideoStream(streams, dispatch);
    }
  }, [pendingUpdate, callStatus.haveMedia, smallFeedEl, streams]);

  return (
    <div className="w-full h-full relative hover:bg-neutral-800 hover:cursor-pointer">
      <div
        className="absolute top-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCaretUp color="#a3a3a3" />
      </div>
      <button
        className="h-full flex flex-col justify-center items-center gap-y-2"
        onClick={startStopVideo}
      >
        <FaVideo size={24} color="#a3a3a3" />
        <p className="text-gray-400 invisible md:visible">
          {callStatus.video === 'enabled' ? 'Stop' : 'Start'} Video
        </p>
      </button>
      {isOpen && (
        <Dropdown
          defaultValue={callStatus.videoDevice}
          changeHandler={changeVideoDevice}
          deviceList={videoDeviceList}
          type="video"
        />
      )}
    </div>
  );
};
export default VideoButton;
