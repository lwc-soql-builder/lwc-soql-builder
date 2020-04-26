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

export function executeQuery(soql, namespace) {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestQuery());

            let headers = {};
            if (namespace) {
                headers = {
                    ...headers,
                    'Sforce-Call-Options': `defaultNamespace=${namespace}`
                };
            }
            salesforce.connection
                .request({
                    method: 'GET',
                    url: `/query?q=${encodeURIComponent(soql)}`,
                    headers
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
