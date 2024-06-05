import { combineReducers } from 'redux';

import { callStatusReducer } from './callStatus/callStatus.reducer';
import { streamsReducer } from './streams/streams.reducer';

export const rootReducer = combineReducers({
  callStatus: callStatusReducer,
  streams: streamsReducer,
});
