import * as salesforce from '../../../service/salesforce';

import {
    REQUEST_QUERY,
    RECEIVE_QUERY_SUCCESS,
    RECEIVE_QUERY_ERROR,
    CLEAR_QUERY_ERROR
} from './constants';
import { updateApiLimit } from '../ui/actions';

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

export function executeQuery(soql, isAllRows) {
    const apiPath = isAllRows ? '/queryAll' : '/query';
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestQuery());

            salesforce.connection
                .request({
                    method: 'GET',
                    url: `${apiPath}?q=${encodeURIComponent(soql)}`,
                    headers: salesforce.getRequestHeaders()
                })
                .then(res => {
                    dispatch(receiveQuerySuccess(res, soql));
                    dispatch(updateApiLimit());
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
