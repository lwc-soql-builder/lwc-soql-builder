import salesforce from '../../../../service/salesforceService';

import {
    REQUEST_SOBJECT,
    RECEIVE_SOBJECT_SUCCESS,
    RECEIVE_SOBJECT_ERROR
} from './constants';

function requestSObject() {
    return {
        type: REQUEST_SOBJECT
    };
}

function receiveSObjectSuccess(data) {
    return {
        type: RECEIVE_SOBJECT_SUCCESS,
        payload: { data }
    };
}

function receiveSObjectError(error) {
    return {
        type: RECEIVE_SOBJECT_ERROR,
        payload: { error }
    };
}

function shouldFetchSObject({ sobject }, sObjectName) {
    return !sobject[sObjectName] || !sobject[sObjectName].data;
}

function describeSObject(sObjectName) {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestSObject());

            salesforce.connection
                .request(
                    `/services/data/v48.0/sobjects/${sObjectName}/describe`
                )
                .then(res => {
                    console.log(res);
                    dispatch(receiveSObjectSuccess(res));
                })
                .catch(err => {
                    console.error(err);
                    dispatch(receiveSObjectError(err));
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
