import {
    REQUEST_SOBJECTS,
    RECEIVE_SOBJECTS_SUCCESS,
    RECEIVE_SOBJECTS_ERROR,
    SELECT_SOBJECT,
    DESELECT_SOBJECT
} from './constants';

function getSobject(state, action) {
    if (!state.data || !state.data.sobjects) return null;
    return state.data.sobjects.find(
        sobject => sobject.name === action.payload.sObjectName
    );
}

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
                error: action.payload.error
            };

        case SELECT_SOBJECT:
            return {
                ...state,
                selectedSObject: getSobject(state, action)
            };

        case DESELECT_SOBJECT:
            return {
                ...state,
                selectedSObject: undefined
            };

        default:
            return state;
    }
}
