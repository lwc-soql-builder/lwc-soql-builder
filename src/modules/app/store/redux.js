import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import logger from './middlewares/logger';

import sobjects from './modules/sobjects/reducers';
import sobject from './modules/sobject/reducers';
import query from './modules/query/reducers';

let middlewares = [thunk, logger];

export const store = createStore(
    combineReducers({
        sobjects,
        sobject,
        query
    }),
    applyMiddleware(...middlewares)
);
