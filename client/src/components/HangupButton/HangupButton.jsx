import { useDispatch, useSelector } from 'react-redux';
import { updateCallStatus } from '../../store/callStatus/callStatus.actions';

const HangupButton = (
  {
    // largeFeedEl, smallFeedEl
  }
) => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  // const streams = useSelector((state) => state.streams);

  const hangupCall = () => {
    dispatch(updateCallStatus('current', 'complete'));
    //user has clicked hang up
    // for (const s in streams) {
    //   //loop through all streams, and if there is a pc, close it
    //   //remove listeners
    //   //set it to null
    //   if (streams[s].peerConnection) {
    //     streams[s].peerConnection.close();
    //     streams[s].peerConnection.onicecandidate = null;
    //     streams[s].peerConnection.onaddstream = null;
    //     streams[s].peerConnection = null;
    //   }
    // }
    // //set both video tags to empty
    // smallFeedEl.current.srcObject = null;
    // largeFeedEl.current.srcObject = null;
  };

  if (callStatus.current === 'complete') {
    return <></>;
  }

  //add position relative
  return (
    <button
      onClick={hangupCall}
      className="bg-red-600 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-md shadow"
    >
      Hang Up
    </button>
  );
};

export default HangupButton;
