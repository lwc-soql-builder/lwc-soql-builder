import salesforce from '../../../../service/salesforce';

import {
    REQUEST_QUERY,
    RECEIVE_QUERY_SUCCESS,
    RECEIVE_QUERY_ERROR,
    CLEAR_QUERY_ERROR
} from './constants';

function requestQuery() {
    return {
        type: REQUEST_QUERY
    };
}

function receiveQuerySuccess(data, soql) {
    return {
        type: RECEIVE_QUERY_SUCCESS,
        payload: { data, soql }
    };
}

function receiveQueryError(error) {
    return {
        type: RECEIVE_QUERY_ERROR,
        payload: { error }
    };
}

export function executeQuery(soql) {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestQuery());

            salesforce.connection
                .query(soql)
                .then(res => {
                    dispatch(receiveQuerySuccess(res, soql));
                })
                .catch(err => {
                    dispatch(receiveQueryError(err));
                });
        }
    };
}

export function clearQueryError() {
    return {
        type: CLEAR_QUERY_ERROR
    };
}
