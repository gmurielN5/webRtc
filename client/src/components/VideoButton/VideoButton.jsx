import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startLocalVideoStream } from '../../utils/startVideoStream';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';
import { addStream } from '../../store/streams/streams.actions';
import { getDevices } from '../../utils/getDevices';
import { Dropdown } from '../Dropdown/Dropdown';
import { FaCaretUp, FaVideo } from 'react-icons/fa6';

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
    const [videoTrack] = stream.getVideoTracks();
    for (const s in streams) {
      if (s !== 'localStream') {
        //  RTCRtpSender manages how tracks are sent via the Peer Connection
        const senders = streams[s].peerConnection.getSenders();
        //find the sender that is in charge of the video track
        const sender = senders.find((s) => {
          if (s.track) {
            //if this track matches the videoTrack kind, return it
            return s.track.kind === videoTrack.kind;
          } else {
            return false;
          }
        });
        //sender is RTCRtpSender, replace the track
        sender.replaceTrack(videoTrack);
      }
    }
  };

  const startStopVideo = () => {
    //first, check if the video is enabled, if so disabled
    if (callStatus.video === 'enabled') {
      //update redux callStatus
      dispatch(updateCallStatus('video', 'disabled'));
      //set the stream to disabled
      const tracks = streams.localStream.stream.getVideoTracks();
      tracks.forEach((t) => (t.enabled = false));
    } else if (callStatus.video === 'disabled') {
      dispatch(updateCallStatus('video', 'enabled'));
      const tracks = streams.localStream.stream.getVideoTracks();
      tracks.forEach((t) => (t.enabled = true));
    } else if (callStatus.haveMedia) {
      smallFeedEl.current.srcObject = streams.localStream.stream;
      //add tracks to the peerConnections
      startLocalVideoStream(streams, dispatch);
    } else {
      setPendingUpdate(true);
    }
  };

  useEffect(() => {
    if (pendingUpdate && callStatus.haveMedia) {
      setPendingUpdate(false);
      smallFeedEl.current.srcObject = streams.localStream.stream;
      startLocalVideoStream(streams, dispatch);
    }
  }, [pendingUpdate, callStatus.haveMedia, smallFeedEl, streams]);

  return (
    <div className="relative flex md:w-36 hover:bg-gray-800 hover:cursor-pointer p-2">
      <div
        className="absolute top-1 right-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCaretUp color="#f9fafb" />
      </div>
      <button
        className="flex flex-col justify-center items-center gap-2"
        onClick={startStopVideo}
      >
        <FaVideo size={24} color="#f9fafb" />
        <p className="text-gray-50 hidden md:block">
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
