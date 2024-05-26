import { useDispatch, useSelector } from 'react-redux';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';

const HangupButton = ({ largeFeedEl, smallFeedEl }) => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);

  const hangupCall = () => {
    dispatch(updateCallStatus('current', 'complete'));
    for (const s in streams) {
      if (streams[s].peerConnection) {
        streams[s].peerConnection.close();
        streams[s].peerConnection.onicecandidate = null;
        streams[s].peerConnection.onaddstream = null;
        streams[s].peerConnection = null;
      }
    }
    smallFeedEl.current.srcObject = null;
    largeFeedEl.current.srcObject = null;
  };

  return (
    <>
      {callStatus.current === 'complete' ? null : (
        <button
          onClick={hangupCall}
          className="bg-red-600 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-md shadow m-2"
        >
          Hang Up
        </button>
      )}
    </>
  );
};

export default HangupButton;
