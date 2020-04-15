import {
    REQUEST_USER,
    RECEIVE_USER_SUCCESS,
    RECEIVE_USER_ERROR,
    CLEAR_USER_ERROR
} from './constants';
import { LOGOUT } from '../ui/constants';

export default function user(
    state = {
        isFetching: false,
        data: null,
        error: null
    },
    action
) {
    switch (action.type) {
        case REQUEST_USER:
            return {
                ...state,
                isFetching: true,
                data: undefined,
                error: undefined
            };

        case RECEIVE_USER_SUCCESS:
            return {
                ...state,
                isFetching: false,
                data: action.payload.data,
                error: undefined
            };

        case RECEIVE_USER_ERROR:
            return {
                ...state,
                isFetching: false,
                data: undefined,
                error: action.payload.error
            };

        case CLEAR_USER_ERROR:
            return {
                ...state,
                error: undefined
            };

        case LOGOUT:
            return {
                ...state,
                data: undefined,
                error: undefined
            };

        default:
            return state;
    }
}
