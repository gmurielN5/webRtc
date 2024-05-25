import moment from 'moment';
import { useEffect, useState } from 'react';

const CallInfo = ({ meetingInfo }) => {
  const [momentText, setMomentText] = useState(
    moment(meetingInfo.date).fromNow()
  );

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setMomentText(moment(meetingInfo.date).fromNow());
    }, 5000);
    return () => {
      clearInterval(timeInterval);
    };
  }, [setMomentText, meetingInfo.date]);

  return (
    <div className="absolute w-96 top-1/3 right-1/3 bg-neutral-950 shadow-neutral-100 rounded p-6">
      <h1 className="text-gray-50 text-center">
        {meetingInfo.fullName} has been notified.
        <br />
        Your appointment is {momentText}.
      </h1>
    </div>
  );
};

export default CallInfo;
