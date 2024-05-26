import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const CallInfo = ({ pro, meetingInfo }) => {
  const [searchParams] = useSearchParams();
  const [momentText, setMomentText] = useState(
    moment(meetingInfo.apptDate).fromNow()
  );
  useEffect(() => {
    if (!pro) {
      const timeInterval = setInterval(() => {
        setMomentText(moment(meetingInfo.date).fromNow());
      }, 5000);
      return () => {
        clearInterval(timeInterval);
      };
    }
  }, [pro, setMomentText, meetingInfo.date]);

  return (
    <div className="absolute w-80 h-32  m-auto left-0 right-0 top-0 bottom-0 bg-gray-950 shadow-gray-100 rounded p-6 text-gray-50 text-center ">
      {!pro ? (
        <h1>
          {meetingInfo.fullName} has been notified.
          <br />
          Your appointment is {momentText}.
        </h1>
      ) : (
        <h1>
          {searchParams.get('client')} is in the waiting room.
          <br />
          Call will start when video and audio are enabled
        </h1>
      )}
    </div>
  );
};

export default CallInfo;
