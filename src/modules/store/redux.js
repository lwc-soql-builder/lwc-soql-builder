import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import logger from './middlewares/logger';

import user from './modules/user/reducers';
import sobjects from './modules/sobjects/reducers';
import sobject from './modules/sobject/reducers';
import query from './modules/query/reducers';
import ui from './modules/ui/reducers';

let middlewares = [thunk, logger];

export const store = createStore(
    combineReducers({
        user,
        sobjects,
        sobject,
        query,
        ui
    }),
    applyMiddleware(...middlewares)
);
