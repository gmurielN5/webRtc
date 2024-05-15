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
    <div className="call-info">
      <h1>
        {meetingInfo.fullName} has been notified.
        <br />
        Your appointment is {momentText}.
      </h1>
    </div>
  );
};

export default CallInfo;
