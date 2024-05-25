import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { socketConnection } from '../../utils/socketConnection';
import proSocketListeners from '../../utils/proSocketListener';
import moment from 'moment';

import logo from '../../assets/hub.svg';
import {
  FaBars,
  FaXmark,
  FaHouse,
  FaUsers,
  FaCalendar,
  FaCommentDots,
  FaClock,
} from 'react-icons/fa6';

export const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [meetingInfo, setMeetingInfo] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="w-full h-full flex">
      <div className="px-8 py-4  md:w-1/5 md:h-screen flex-col justify-start sm:flex bg-gray-900 shadow">
        <div className="w-full flex items-center">
          <img src={logo} alt="hub logo" />
        </div>
        <ul className="mt-12">
          <li className="flex w-full justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaHouse color="#f9fafb" />
            <span>Dashboard</span>
          </li>
          <li className="flex w-full justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaClock color="#f9fafb" />
            <span>Meetings</span>
          </li>
          <li className="flex w-full justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaUsers color="#f9fafb" />
            <span>Contacts</span>
          </li>
          <li className="flex w-full justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaCommentDots color="#f9fafb" />
            <span>Messages</span>
          </li>
          <li className="flex w-full justify-start gap-2 text-gray-50 cursor-pointer items-center mb-6">
            <FaCalendar color="#f9fafb" />
            <span>Calendar</span>
          </li>
        </ul>
      </div>
      <div className="bg-gray-50 w-full">
        <div className="bg-gray-900 shadow py-8 px-2">
          <h1 className="text-2xl text-gray-50 uppercase">
            Dashboard
          </h1>
        </div>
        <div className="p-8 columns-2 gap-4">
          <div className="h-64 bg-gray-700 p-6 rounded-md">
            <h4 className="text-xl mb-4 text-gray-50">Clients</h4>
            <ul>
              <li className="text-gray-50">Jim Jones</li>
            </ul>
          </div>
          <div className="h-64 bg-gray-700 p-6 rounded-md">
            <h4 className="text-xl mb-4 text-gray-50">
              Coming Appointments
            </h4>
            {meetingInfo.map((a) => (
              <ul key={a.uuid}>
                <li className="min-h-10 flex justify-between items-center text-gray-50">
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