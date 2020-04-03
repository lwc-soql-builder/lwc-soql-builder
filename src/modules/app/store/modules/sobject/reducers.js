import {
    REQUEST_SOBJECT,
    RECEIVE_SOBJECT_SUCCESS,
    RECEIVE_SOBJECT_ERROR
} from './constants';

function sobject(
    state = {
        isFetching: false,
        data: null,
        error: null
    },
    action
) {
    switch (action.type) {
        case REQUEST_SOBJECT:
            return {
                ...state,
                isFetching: true
            };

        case RECEIVE_SOBJECT_SUCCESS:
            return {
                ...state,
                isFetching: false,
                data: action.payload.data,
                error: null
            };

        case RECEIVE_SOBJECT_ERROR:
            return {
                ...state,
                isFetching: false,
                error: action.payload.error
            };

        default:
            return state;
    }
}

export default function sobjects(state = {}, action) {
    switch (action.type) {
        case REQUEST_SOBJECT:
        case RECEIVE_SOBJECT_SUCCESS:
        case RECEIVE_SOBJECT_ERROR: {
            const sobjectState = state[action.payload.sObjectName];
            return {
                ...state,
                [action.payload.sObjectName]: sobject(sobjectState, action)
            };
        }

        default:
            return state;
    }
}
