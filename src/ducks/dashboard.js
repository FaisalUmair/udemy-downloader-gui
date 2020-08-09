const SHOW_LOADING = "app/dashboard/SHOW_LOADING"

const HIDE_LOADING = "app/dashboard/HIDE_LOADING"


export default function reducer(state = { isLoading: false }, action) {
    switch (action.type) {
        case SHOW_LOADING:
            return {
                isLoading: true
            }
        case HIDE_LOADING:
            return {
                isLoading: false
            }

        default:
            return state;
    }
}



export function showLoading() {
    return { type: SHOW_LOADING }
}


export function hideLoading() {
    return { type: HIDE_LOADING }
}