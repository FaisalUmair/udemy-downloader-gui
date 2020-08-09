const LOGIN = 'app/user/LOGIN';

const LOGOUT = 'app/user/LOGOUT';


export default function reducer(state = {}, action) {
    switch (action.type) {
        case LOGIN:
            return { ...state, accessToken: action.accessToken }
        case LOGOUT:
            return { ...state, accessToken: null }
        default:
            return state;
    }
}

export function login(accessToken) {
    return { type: LOGIN, accessToken };
}

export function logout() {
    return { type: LOGOUT };
}