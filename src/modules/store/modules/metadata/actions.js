import * as salesforce from '../../../service/salesforce';

import {
    REQUEST_METADATA,
    RECEIVE_METADATA_SUCCESS,
    RECEIVE_METADATA_ERROR,
    CLEAR_METADATA_ERROR
} from './constants';

function requestMetadata() {
    return {
        type: REQUEST_METADATA
    };
}

function receiveMetadataSuccess(data, soql) {
    return {
        type: RECEIVE_METADATA_SUCCESS,
        payload: { data, soql }
    };
}

function receiveMetadataError(error) {
    return {
        type: RECEIVE_METADATA_ERROR,
        payload: { error }
    };
}

function shouldFetchMetadata({ metadata }) {
    return !metadata || !metadata.data;
}

function fetchMetadata() {
    return async dispatch => {
        if (salesforce.isLoggedIn()) {
            dispatch(requestMetadata());

            salesforce.connection.metadata
                .describe(salesforce.API_VERSION)
                .then(res => {
                    dispatch(receiveMetadataSuccess(res));
                })
                .catch(err => {
                    dispatch(receiveMetadataError(err));
                });
        }
    };
}

export function fetchMetadataIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchMetadata(getState())) {
            dispatch(fetchMetadata());
        }
    };
}

export function clearMetadataError() {
    return {
        type: CLEAR_METADATA_ERROR
    };
}
