import {
    REQUEST_SOBJECTS,
    RECEIVE_SOBJECTS_SUCCESS,
    RECEIVE_SOBJECTS_ERROR,
    CLEAR_SOBJECTS_ERROR
} from './constants';

export default function sobjects(
    state = {
        isFetching: false,
        data: null,
        error: null
    },
    action
) {
    switch (action.type) {
        case REQUEST_SOBJECTS:
            return {
                ...state,
                isFetching: true
            };

        case RECEIVE_SOBJECTS_SUCCESS:
            return {
                ...state,
                isFetching: false,
                data: action.payload.data,
                error: null
            };

        case RECEIVE_SOBJECTS_ERROR:
            return {
                ...state,
                isFetching: false,
                data: undefined,
                error: action.payload.error
            };

        case CLEAR_SOBJECTS_ERROR:
            return {
                ...state,
                error: undefined
            };

        default:
            return state;
    }
}
