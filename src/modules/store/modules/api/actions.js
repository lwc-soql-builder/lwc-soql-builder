import * as salesforce from '../../../service/salesforce';

import {
    REQUEST_API,
    RECEIVE_API_SUCCESS,
    RECEIVE_API_ERROR,
    CLEAR_API_ERROR
} from './constants';
import { updateApiLimit } from '../ui/actions';

function requestApi() {
    return {
        type: REQUEST_API
    };
}

function receiveApiSuccess(data, apiPath) {
    return {
        type: RECEIVE_API_SUCCESS,
        payload: { data, apiPath }
    };
}

function receiveApiError(error) {
    return {
        type: RECEIVE_API_ERROR,
        payload: { error }
    };
}

export function executeApi(apiPath, httpMethod, requestBody) {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestApi());

            salesforce.connection
                .request({
                    method: httpMethod,
                    url: apiPath,
                    body: requestBody,
                    headers: {
                        'Content-Type': 'application/json',
                        ...salesforce.getRequestHeaders()
                    }
                })
                .then(res => {
                    dispatch(receiveApiSuccess(res, apiPath));
                    dispatch(updateApiLimit());
                })
                .catch(err => {
                    dispatch(receiveApiError(err));
                });
        }
    };
}

export function clearApiError() {
    return {
        type: CLEAR_API_ERROR
    };
}
