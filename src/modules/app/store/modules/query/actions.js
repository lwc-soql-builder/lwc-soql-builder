import salesforce from '../../../../service/salesforce';

import {
    REQUEST_QUERY,
    RECEIVE_QUERY_SUCCESS,
    RECEIVE_QUERY_ERROR
} from './constants';

function requestQuery() {
    return {
        type: REQUEST_QUERY
    };
}

function receiveQuerySuccess(data) {
    return {
        type: RECEIVE_QUERY_SUCCESS,
        payload: { data }
    };
}

function receiveQueryError(error) {
    return {
        type: RECEIVE_QUERY_ERROR,
        payload: { error }
    };
}

export function describeQuery(query) {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestQuery());

            salesforce.connection
                .query(query)
                .then(res => {
                    console.log(res);
                    dispatch(receiveQuerySuccess(res));
                })
                .catch(err => {
                    console.error(err);
                    dispatch(receiveQueryError(err));
                });
        }
    };
}
