import * as salesforce from '../../../service/salesforce';

import {
    REQUEST_SOBJECT,
    RECEIVE_SOBJECT_SUCCESS,
    RECEIVE_SOBJECT_ERROR,
    CLEAR_SOBJECT_ERROR
} from './constants';

function requestSObject(sObjectName) {
    return {
        type: REQUEST_SOBJECT,
        payload: { sObjectName }
    };
}

function receiveSObjectSuccess(sObjectName, data) {
    return {
        type: RECEIVE_SOBJECT_SUCCESS,
        payload: { sObjectName, data }
    };
}

function receiveSObjectError(sObjectName, error) {
    return {
        type: RECEIVE_SOBJECT_ERROR,
        payload: { sObjectName, error }
    };
}

function shouldFetchSObject({ sobject }, sObjectName) {
    return !sobject[sObjectName] || !sobject[sObjectName].data;
}

function describeSObject(sObjectName) {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestSObject(sObjectName));

            salesforce.connection
                .describe(sObjectName)
                .then(res => {
                    dispatch(receiveSObjectSuccess(sObjectName, res));
                })
                .catch(err => {
                    dispatch(receiveSObjectError(sObjectName, err));
                });
        }
    };
}

export function describeSObjectIfNeeded(sObjectName) {
    return (dispatch, getState) => {
        if (shouldFetchSObject(getState(), sObjectName)) {
            dispatch(describeSObject(sObjectName));
        }
    };
}

export function clearSObjectError(sObjectName) {
    return {
        type: CLEAR_SOBJECT_ERROR,
        payload: { sObjectName }
    };
}
