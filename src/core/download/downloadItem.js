import {
  fileDownloadFinished,
  FILE_DOWNLOAD_FINISHED,
  updateCourseVisitedFiles,
  UPDATE_COURSE_VISITED_FILES,
} from "../../ducks/downloads"
import downloadArticle from "./downloadArticle"
import downloadCaption from "./downloadCaption"
import downloadEBook from "./downloadEBook"
import downloadExternalLink from "./downloadExternalLink"
import downloadFile from "./downloadFile"
import downloadHandler from "./downloadHandler"
import downloadVideo from "./downloadVideo"

export default function downloadItem(dispatch, getState, courseId, item) {
  const course = getState().downloads[courseId]
  if (!course) return
  const { visitedFiles } = course
  const isLecture = item.hasOwnProperty("asset")
  const type = isLecture
    ? item.asset.asset_type
    : item.asset_type
    ? item.asset_type
    : item._class

  switch (type) {
    case "Video":
      console.log('hit')
      return downloadVideo(item, dispatch, getState, courseId, isLecture)
    case "Article":
      console.log("article", isLecture)
      return downloadArticle(item, dispatch, getState, courseId, isLecture)
    case "E-Book":
      return downloadEBook(item, dispatch, getState, courseId, isLecture)
    case "ExternalLink":
      return downloadExternalLink(item, dispatch, getState, courseId)
    case "File":
      return downloadFile(item, dispatch, getState, courseId)
    case "caption":
      return downloadCaption(item, dispatch, getState, courseId)
  }

  // dispatch({
  //   type: FILE_DOWNLOAD_FINISHED,
  //   courseid: courseId,
  // })
  dispatch(fileDownloadFinished(courseId))
  // dispatch({
  //   type: UPDATE_COURSE_VISITED_FILES,
  //   courseid: courseId,
  //   visitedFiles: visitedFiles + 1,
  // })
  dispatch(updateCourseVisitedFiles(courseId, visitedFiles))
  return downloadHandler(dispatch, getState, courseId)
}
