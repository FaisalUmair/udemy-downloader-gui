import initializeDownload from "./initializeDownload"
import handleItem from "./handleItem"
import {
  courseDownloadFinished,
  updateDownloaderStatus,
} from "../../ducks/downloads"

export default function downloadHandler(dispatch, getState, courseId) {
  try {
    const courseInfo = getState().downloads[courseId]
    if (!courseInfo) return
    const { started: hasStarted } = courseInfo

    if (courseInfo.downloaded == courseInfo.total) {
      // dispatch(courseDownloadFinished(courseId))
      dispatch(updateDownloaderStatus(courseId, "finished"))
    }

    if (!hasStarted) {
      return initializeDownload(dispatch, getState, courseId)
    }

    console.log(getState().downloads[courseId])
    handleItem(getState, dispatch, courseInfo)
  } catch (e) {
    return
  }
}
