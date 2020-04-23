import * as salesforce from '../../../service/salesforce';

import {
    REQUEST_USER,
    RECEIVE_USER_SUCCESS,
    RECEIVE_USER_ERROR,
    CLEAR_USER_ERROR
} from './constants';

function requestUser() {
    return {
        type: REQUEST_USER
    };
}

function receiveUserSuccess(data) {
    return {
        type: RECEIVE_USER_SUCCESS,
        payload: { data }
    };
}

function receiveUserError(error) {
    return {
        type: RECEIVE_USER_ERROR,
        payload: { error }
    };
}

export function fetchUser(sObjectName) {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestUser(sObjectName));

            salesforce.connection
                .request('/services/oauth2/userinfo')
                .then(res => {
                    dispatch(receiveUserSuccess(res));
                })
                .catch(err => {
                    dispatch(receiveUserError(err));
                });
        }
    };
}

export function clearUserError() {
    return {
        type: CLEAR_USER_ERROR
    };
}
