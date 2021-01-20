import { showLoading, hideLoading } from "./dashboard"

import { getCurriculum, getItemInfo } from "../core/course"
import downloadHandler from "../core/download/downloadHandler"

import { download } from "../core/download"
const captions = []

const NEW_COURSE_DOWNLOAD = "app/downloads/NEW_COURSE_DOWNLOAD"

const START_DOWNLOAD = "app/downloads/START_DOWNLOAD"

export const DOWNLOAD_STARTED = "app/downloads/DOWNLOAD_STARTED"

const PAUSE_DOWNLOAD = "app/downloads/PAUSE_DOWNLOAD"

export const DOWNLOAD_PAUSED = "app/downloads/DOWNLOAD_PAUSED"

const RESUME_DOWNLOAD = "app/downloads/RESUME_DOWNLOAD"

export const UPDATE_PROGRESS = "app/downloads/UPDATE_PROGRESS"

export const UPDATE_COURSE_VISITED_FILES =
  "app/downloads/UPDATE_COURSE_VISITED_FILES"

export const COURSE_DOWNLOAD_STARTED = "app/downloads/COURSE_DOWNLOAD_STARTED"

export const COURSE_DOWNLOAD_FINISHED = "app/downloads/COURSE_DOWNLOAD_FINISHED"

export const NEW_CHAPTER_STARTED = "app/downloads/NEW_CHAPTER_STARTED"

export const FILE_DOWNLOAD_FINISHED = "app/downloads/FILE_DOWNLOAD_FINISHED"

export const UPDATE_CHAPTER_NUMBER = "app/downloads/UPDATE_CHAPTER_NUMBER"
export const UPDATE_LECTURE_NUMBER = "app/downloads/UPDATE_LECTURE_NUMBER"
export const UPDATE_FILE_TYPE = "app/downloads/UPDATE_FILE_TYPE"
export const UPDATE_VIDEO_QUALITY = "app/downloads/UPDATE_VIDEO_QUALITY"
export const DELETE_DOWNLOAD = "app/downloads/DELETE_DOWNLOAD"
export const UPDATE_INFO = "app/downloads/UPDATE_INFO"

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
          settings: action.settings,
          speed: 0,
          visitedFiles: 0,
          chapterNumber: 0,
          lectureNumber: 0,
          started: false,
          downloadFinished: false,
        },
      }
    case DELETE_DOWNLOAD: {
      const modifiedState = { ...state }
      delete modifiedState[action.courseid]
      return modifiedState
    }

    case UPDATE_INFO: {
      if (state[action.courseid]) {
        return {
          ...state,
          [action.courseid]: {
            ...state[action.courseid],
            ...action.payload,
          },
        }
      }
      return state
    }

    // case UPDATE_FILE_TYPE: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       fileType: action.fileType,
    //       dlFileName: action.dlFileName,
    //     },
    //   }
    // }
    // case UPDATE_VIDEO_QUALITY: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       videoQuality: action.videoQuality,
    //     },
    //   }
    // }
    // case UPDATE_CHAPTER_NUMBER: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       chapterNumber: action.chapterNumber,
    //     },
    //   }
    // }
    // case UPDATE_LECTURE_NUMBER: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       lectureNumber: action.lectureNumber,
    //     },
    //   }
    // }
    // case FILE_DOWNLOAD_FINISHED: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       downloaded: state[action.courseid].downloaded + 1,
    //       downloadInstance: null,
    //     },
    //   }
    // }
    // case NEW_CHAPTER_STARTED: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       chapter: action.chapter,
    //     },
    //   }
    // }
    // case COURSE_DOWNLOAD_FINISHED: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       downloadFinished: true,
    //     },
    //   }
    // }
    // case COURSE_DOWNLOAD_STARTED: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       started: true,
    //       parentPath: action.parentPath,
    //     },
    //   }
    // }
    // case UPDATE_COURSE_VISITED_FILES: {
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       visitedFiles: action.visitedFiles,
    //     },
    //   }
    // }
    // case START_DOWNLOAD:
    // case PAUSE_DOWNLOAD:
    // case RESUME_DOWNLOAD:
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       status: "waiting",
    //     },
    //   }
    // case DOWNLOAD_STARTED:
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       downloadInstance: action.downloadInstance,
    //       status: "downloading",
    //     },
    //   }
    // case DOWNLOAD_PAUSED:
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       status: "paused",
    //     },
    //   }
    // case UPDATE_PROGRESS:
    //   return {
    //     ...state,
    //     [action.courseid]: {
    //       ...state[action.courseid],
    //       currentProgress: action.currentProgress,
    //     },
    //   }
    default:
      return state
  }
}

export function downloadCourse(course, setLoading, settings) {
  return (dispatch, getState) => {
    setLoading(true)
    dispatch(showLoading())
    getCurriculum(getState().user.accessToken, course.id).then((response) => {

      setLoading(false)
      dispatch(hideLoading())

      // const allowed = ["Video", "Article", "File", "E-Book", "ExternalLink"]
      const allowed = [...settings.allowedAttachments, "Video"]

      const subtitlesAllowed =
        settings.subtitleOption === "download" ? true : false

      const subtitleLanguage = settings.subtitleLanguage

      let total = 0

      const curriculum = response.data.results.filter((item) => {
        if (item._class === "chapter") {
          return true
        } else if (
          item._class === "lecture" &&
          allowed.includes(item.asset.asset_type)
        ) {
          total++

          if (subtitlesAllowed && item.asset.captions.length) {
            let subtitleFound,
              autoSubtitleFound = false
            let autoSubtitleIndex = null

            for (var key in item.asset.captions) {
              if (item.asset.captions[key].video_label === subtitleLanguage) {
                subtitleFound = true
                total++
                item.asset.caption = item.asset.captions[key]
                break
              } else if (
                item.asset.captions[key].video_label
                  .replace("[Auto]", "")
                  .trim() === subtitleLanguage
              ) {
                autoSubtitleFound = true
                autoSubtitleIndex = key
              }
            }

            if (!subtitleFound) {
              if (autoSubtitleFound) {
                total++
                item.asset.caption = item.asset.captions[autoSubtitleIndex]
              }
            }
          }

          delete item.asset.captions

          item.supplementary_assets = item.supplementary_assets.filter(
            (asset) => allowed.includes(asset.asset_type)
          )
          total += item.supplementary_assets.length
          return true
        }

        return false
      })


      dispatch({
        type: NEW_COURSE_DOWNLOAD,
        course,
        curriculum,
        total,
        settings: settings,
      })
      if (settings.lectureOption == "downloadAll") {
        dispatch(startDownload(course.id))
        return
      }
    })
  }
}

export function pauseDownload(courseid) {
  return (dispatch, getState) => {
    // dispatch({ type: PAUSE_DOWNLOAD, courseid })
    dispatch(updateDownloaderStatus(courseid, "waiting"))
    const downloader = getState().downloads[courseid].downloadInstance
    if (downloader) {
      downloader.stop()
    }
  }
}

export function resumeDownload(courseid) {
  return (dispatch, getState) => {
    // dispatch({ type: RESUME_DOWNLOAD, courseid })
    dispatch(updateDownloaderStatus(courseid, "waiting"))
    // dispatch(startDownload(courseid))
    downloadHandler(dispatch, getState, courseid)
  }
}

export function startDownload(courseid) {
  return (dispatch, getState) => {
    // dispatch({ type: START_DOWNLOAD, courseid })
    dispatch(updateDownloaderStatus(courseid, "waiting"))
    // download(courseid, dispatch, getState)
    downloadHandler(dispatch, getState, courseid)
  }
}

export function deleteDownload(courseid) {
  console.log("hit", courseid)
  pauseDownload(courseid)
  return (dispatch, getState) => {
    dispatch({
      type: DELETE_DOWNLOAD,
      courseid,
    })
  }
}

export function downloadStarted(courseId, parentPath) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        started: true,
        parentPath,
      },
    })
  }
}

export function courseDownloadFinished(courseId) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        downloadFinished: true,
      },
    })
  }
}

export function updateChapterNumber(courseId, chapterNumber) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        chapterNumber: chapterNumber + 1,
        lectureNumber: 0,
      },
    })
  }
}

export function updateLectureNumber(courseId, lectureNumber) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        lectureNumber: lectureNumber + 1,
      },
    })
  }
}

export function updateChapterName(courseId, chapterName) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        chapter: chapterName,
      },
    })
  }
}

export function updateCourseVisitedFiles(courseId, count) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        visitedFiles: count + 1,
      },
    })
  }
}

export function fileDownloadFinished(courseId) {
  return (dispatch, getState) => {
    const course = getState().downloads[courseId]
    if (!course) return
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        downloaded: course.downloaded + 1,
        downloadInstance: null,
      },
    })
  }
}

export function updateFileData(courseId, fileType, filename, quality) {
  const payloadData = {
    fileType: fileType,
    dlFileName: filename,
  }

  const data = quality ? { ...payloadData, videoQuality: quality } : payloadData

  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: data,
    })
  }
}

export function downloaderStarted(courseId, downloaderInstance) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        downloadInstance: downloaderInstance,
        status: "downloading",
      },
    })
  }
}

export function updateDownloaderProgress(courseId, currentProgress) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        currentProgress,
      },
    })
  }
}

export function updateDownloaderStatus(courseId, status) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_INFO,
      courseid: courseId,
      payload: {
        status: status,
      },
    })
  }
}
