import { compose, createStore } from 'redux';

import { rootReducer } from './root-reducer';

// declare global {
//   interface Window {
//     __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
//   }
// }

export const store = createStore(rootReducer);
