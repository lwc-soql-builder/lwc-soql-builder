import salesforce from '../../../../service/salesforce';

import {
    REQUEST_SOBJECTS,
    RECEIVE_SOBJECTS_SUCCESS,
    RECEIVE_SOBJECTS_ERROR,
    SELECT_SOBJECT,
    DESELECT_SOBJECT
} from './constants';

function requestSObjects() {
    return {
        type: REQUEST_SOBJECTS
    };
}

function receiveSObjectsSuccess(data) {
    return {
        type: RECEIVE_SOBJECTS_SUCCESS,
        payload: { data }
    };
}

function receiveSObjectsError(error) {
    return {
        type: RECEIVE_SOBJECTS_ERROR,
        payload: { error }
    };
}

export function selectSObject(sObjectName) {
    return {
        type: SELECT_SOBJECT,
        payload: { sObjectName }
    };
}

export function deselectSObject() {
    return {
        type: DESELECT_SOBJECT
    };
}

function shouldFetchSObjects({ sobjects }) {
    return !sobjects || !sobjects.data;
}

function fetchSObjects() {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestSObjects());

            salesforce.connection
                .request('/services/data/v48.0/sobjects')
                .then(res => {
                    console.log(res);
                    dispatch(receiveSObjectsSuccess(res));
                })
                .catch(err => {
                    console.error(err);
                    dispatch(receiveSObjectsError(err));
                });
        }
    };
}

export function fetchSObjectsIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchSObjects(getState())) {
            dispatch(fetchSObjects());
        }
    };
}
