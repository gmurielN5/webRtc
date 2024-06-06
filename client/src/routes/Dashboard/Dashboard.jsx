import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { socketConnection } from '../../utils/socketConnection';
import proSocketListeners from '../../utils/proSocketListener';
import moment from 'moment';

import logo from '../../assets/hub.svg';
import {
  FaHouse,
  FaUsers,
  FaCalendar,
  FaCommentDots,
  FaClock,
} from 'react-icons/fa6';

export const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [meetingInfo, setMeetingInfo] = useState([]);
  // const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    //grab the token var out of the query string
    const token = searchParams.get('token');
    const socket = socketConnection(token);
    proSocketListeners.proDashabordSocketListeners(
      socket,
      setMeetingInfo,
      dispatch
    );
  }, [searchParams, dispatch]);

  const joinCall = (meeting) => {
    const token = searchParams.get('token');
    navigate(
      `/join-video-pro?token=${token}&uuid=${meeting.uuid}&client=${meeting.clientName}`
    );
  };

  return (
    <div className="w-full h-full flex flex-col-reverse md:flex-row">
      <div className="fixed bottom-0 w-full md:relative md:w-1/5 md:h-screen flex-col justify-start bg-gray-900 shadow px-8 py-4">
        <div className="w-full hidden md:flex items-center">
          <img src={logo} alt="hub logo" />
        </div>
        <ul className="md:mt-12 flex justify-center md:flex-col">
          <li className="flex w-full justify-center md:justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaHouse color="#f9fafb" />
            <span className="hidden md:block">Dashboard</span>
          </li>
          <li className="flex w-full justify-center md:justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaClock color="#f9fafb" />
            <span className="hidden md:block">Meetings</span>
          </li>
          <li className="flex w-full justify-center  md:justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaUsers color="#f9fafb" />
            <span className="hidden md:block">Contacts</span>
          </li>
          <li className="flex w-full justify-center md:justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaCommentDots color="#f9fafb" />
            <span className="hidden md:block">Messages</span>
          </li>
          <li className="flex w-full justify-center md:justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaCalendar color="#f9fafb" />
            <span className="hidden md:block">Calendar</span>
          </li>
        </ul>
      </div>
      <div className="bg-gray-800 w-full pb-12">
        <div className="bg-gray-900 shadow py-2 md:py-8 px-2 flex items-center gap-4">
          <div className="md:hidden">
            <img src={logo} alt="hub logo" />
          </div>
          <h1 className="text-2xl text-gray-50 uppercase">
            Dashboard
          </h1>
        </div>
        <div className="p-8 md:columns-2 gap-4">
          <div className="min-h-64 bg-gray-50 p-6 rounded-md mb-4 text-gray-900">
            <h4 className="text-xl mb-4">Clients</h4>
            <ul>
              <li>Jim Jones</li>
            </ul>
          </div>
          <div className="min-h-64 bg-gray-50 p-6 rounded-md text-gray-900">
            <h4 className="text-xl mb-4">Coming Appointments</h4>
            {meetingInfo.map((a) => (
              <ul key={a.uuid}>
                <li className="min-h-10 md:flex justify-between items-center">
                  {a.clientName} - {moment(a.meetingDate).calendar()}
                  {a.waiting ? (
                    <div className="flex justify-between items-center gap-4">
                      <p className="text-lg animate-pulse text-red-600">
                        Waiting
                      </p>
                      <button
                        className="bg-red-600 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-md shadow"
                        onClick={() => joinCall(a)}
                      >
                        Join
                      </button>
                    </div>
                  ) : (
                    <></>
                  )}
                </li>
              </ul>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
