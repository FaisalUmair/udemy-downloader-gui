import { downloadStarted } from "../../ducks/downloads"
import downloadHandler from "./downloadHandler"

export default function initializeDownload(dispatch, getState, courseId) {
  const courseInfo = getState().downloads[courseId]
  if (!courseInfo) return
  const parentPath = `${courseInfo.settings.downloadPath}/${courseInfo.title}`
  dispatch(downloadStarted(courseId, parentPath))
  return downloadHandler(dispatch, getState, courseId)
}
