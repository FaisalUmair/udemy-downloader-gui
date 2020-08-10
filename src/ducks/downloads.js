import { showLoading, hideLoading } from './dashboard'

import { getCurriculum, getItemInfo } from '../core/course'

import { download } from '../core/download'
const captions = []

const NEW_COURSE_DOWNLOAD = 'app/downloads/NEW_COURSE_DOWNLOAD';

const START_DOWNLOAD = 'app/downloads/START_DOWNLOAD';

export const DOWNLOAD_STARTED = 'app/downloads/DOWNLOAD_STARTED';

const PAUSE_DOWNLOAD = 'app/downloads/PAUSE_DOWNLOAD';

export const DOWNLOAD_PAUSED = 'app/downloads/DOWNLOAD_PAUSED';

const RESUME_DOWNLOAD = 'app/downloads/RESUME_DOWNLOAD';

export const UPDATE_PROGRESS = 'app/downloads/UPDATE_PROGRESS'


export default function reducer(state = {}, action) {
    switch (action.type) {
        case NEW_COURSE_DOWNLOAD:
            return {
                ...state,
                [action.course.id]: {
                    curriculum: action.curriculum,
                    ...action.course,
                    status: "downloading",
                    downloaded: 0,
                    total: action.total,
                    currentProgress: 0,
                    totalProgress: 0,
                    downloadInstance: null,
                    speed: 0
                }
            }
        case START_DOWNLOAD:
        case PAUSE_DOWNLOAD:
        case RESUME_DOWNLOAD:

            return {
                ...state,
                [action.courseid]: {
                    ...state[action.courseid],
                    status: "waiting"
                }
            }
        case DOWNLOAD_STARTED:
            return {
                ...state,
                [action.courseid]: {
                    ...state[action.courseid],
                    downloadInstance: action.downloadInstance,
                    status: "downloading"
                }
            }
        case DOWNLOAD_PAUSED:
            return {
                ...state,
                [action.courseid]: {
                    ...state[action.courseid],
                    status: "paused"
                }
            }
        case UPDATE_PROGRESS:
            return {
                ...state,
                [action.courseid]: {
                    ...state[action.courseid],
                    currentProgress: action.currentProgress
                }
            }
        default:
            return state;
    }
}

export function downloadCourse(course, setLoading) {
    return (dispatch, getState) => {
        setLoading(true);
        dispatch(showLoading());
        getCurriculum(getState().user.accessToken, course.id).then((response) => {
            setLoading(false);
            dispatch(hideLoading());

            const allowed = ["Video", "Article", "File", "E-Book"]



            let total = 0;

            const curriculum = response.data.results.filter((item) => {
                if (item._class === "chapter") {
                    return true;
                } else if (item._class === "lecture" && allowed.includes(item.asset.asset_type)) {
                    total++;
                    item.supplementary_assets = item.supplementary_assets.filter((asset) => allowed.includes(asset.asset_type))
                    total += item.supplementary_assets.length;
                    return true;
                }

                return false;
            })




            curriculum.forEach((item) => {
                if (item._class == "lecture") {
                    //console.log(item.asset.captions)
                    item.asset.captions.forEach((subtile) => {
                        const language = subtile.video_label.replace("[Auto]", "").trim();
                        return !captions.includes(language) ? captions.push(language) : null;
                    })
                }
            })

            console.log(captions);



            // dispatch({ type: NEW_COURSE_DOWNLOAD, course, curriculum, total })


            //console.log(response.data.results)
            // response.data.results.forEach((item) => {
            //     if (item._class === 'lecture') {
            //         console.log(item.asset.asset_type)
            //     }
            // })
            //dispatch(startDownload(course.id))
        })
    }
}


export function pauseDownload(courseid) {
    return (dispatch, getState) => {
        dispatch({ type: PAUSE_DOWNLOAD, courseid })
        const downloader = getState().downloads[courseid].downloadInstance;
        downloader.stop();
    }
}


export function resumeDownload(courseid) {
    return (dispatch, getState) => {
        dispatch({ type: RESUME_DOWNLOAD, courseid })
        dispatch(startDownload(courseid))
    }
}


export function startDownload(courseid) {
    return (dispatch, getState) => {
        dispatch({ type: START_DOWNLOAD, courseid })
        download(courseid, dispatch, getState)
    }
}