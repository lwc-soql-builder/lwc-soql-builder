import {
    REQUEST_METADATA,
    RECEIVE_METADATA_SUCCESS,
    RECEIVE_METADATA_ERROR,
    CLEAR_METADATA_ERROR
} from './constants';

export default function query(
    state = {
        isFetching: false,
        data: null,
        error: null
    },
    action
) {
    switch (action.type) {
        case REQUEST_METADATA:
            return {
                ...state,
                isFetching: true,
                data: undefined,
                error: undefined
            };

        case RECEIVE_METADATA_SUCCESS:
            return {
                ...state,
                isFetching: false,
                data: action.payload.data,
                error: undefined
            };

        case RECEIVE_METADATA_ERROR:
            return {
                ...state,
                isFetching: false,
                data: undefined,
                error: action.payload.error
            };

        case CLEAR_METADATA_ERROR:
            return {
                ...state,
                error: undefined
            };

        default:
            return state;
    }
}
