import {
    REQUEST_API,
    RECEIVE_API_SUCCESS,
    RECEIVE_API_ERROR,
    CLEAR_API_ERROR
} from './constants';

export default function api(
    state = {
        isFetching: false,
        data: null,
        error: null
    },
    action
) {
    switch (action.type) {
        case REQUEST_API:
            return {
                ...state,
                isFetching: true,
                data: undefined,
                error: undefined
            };

        case RECEIVE_API_SUCCESS:
            return {
                ...state,
                isFetching: false,
                data: action.payload.data,
                error: undefined
            };

        case RECEIVE_API_ERROR:
            return {
                ...state,
                isFetching: false,
                data: undefined,
                error: action.payload.error
            };

        case CLEAR_API_ERROR:
            return {
                ...state,
                error: undefined
            };

        default:
            return state;
    }
}
