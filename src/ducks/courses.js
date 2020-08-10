import { getCourses, findCourse } from '../core/course';

import { showLoading, hideLoading } from './dashboard'


const LOAD_COURSES = 'app/courses/LOAD_COURSES';

const SEARCH_COURSES = 'app/courses/SEARCH_COURSES';

const COURSES_LOADED = 'app/courses/COURSES_LOADED';



export default function reducer(state = { data: [], search: null, total: 0, pageNumber: 1 }, action) {
    switch (action.type) {
        case LOAD_COURSES:
        case SEARCH_COURSES:
            return {
                ...state,
                data: [...state.data],
                search: action.search
            }
        case COURSES_LOADED:
            return {
                ...state,
                data: action.courses.results,
                total: action.courses.count,
                pageNumber: action.pageNumber ? action.pageNumber : 1
            }
        default:
            return state;
    }
}



export function loadCourses(pageNumber) {
    return (dispatch, getState) => {
        dispatch(showLoading());
        dispatch({ type: LOAD_COURSES })
        getCourses(getState().user.accessToken, pageNumber).then((response) => {
            dispatch(hideLoading());
            dispatch({ type: COURSES_LOADED, courses: response.data, pageNumber })
        })
    }
}


export function searchCourses(search, pageNumber) {
    return (dispatch, getState) => {
        dispatch(showLoading());
        dispatch({ type: SEARCH_COURSES, search })
        findCourse(getState().user.accessToken, search, pageNumber).then((response) => {
            dispatch(hideLoading());
            dispatch({ type: COURSES_LOADED, courses: response.data, pageNumber })
        })
    }
}