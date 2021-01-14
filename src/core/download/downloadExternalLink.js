import createFile from "./createFile"
import { download } from "."
import {
  fileDownloadFinished,
  FILE_DOWNLOAD_FINISHED,
  updateCourseVisitedFiles,
  updateFileData,
  UPDATE_COURSE_VISITED_FILES,
  UPDATE_FILE_TYPE,
} from "../../ducks/downloads"
import downloadHandler from "./downloadHandler"
import urlFetcher from "./urlFetcher"

function generateContent(url) {
  return `[InternetShortcut]
URL=${url}`
}

export default async function downloadExternalLink(
  item,
  dispatch,
  getState,
  courseId
) {
  const course = getState().downloads[courseId]
  if (!course) return
  const response = await urlFetcher.asset(
    getState,
    courseId,
    item.id,
    item.lectureId
  )
  if (response) {
    const path = `${course.parentPath}/${course.chapter}`
    const content = generateContent(response.external_url)
    const fileName = `${path}/${course.chapterNumber}.${course.lectureNumber} ${response.filename}.url`
    console.log(response, "ExternalLink", path)
    // dispatch({
    //   type: UPDATE_FILE_TYPE,
    //   courseid: course.id,
    //   fileType: "ExternalLink",
    //   dlFileName: `${response.filename}.url`,
    // })

    dispatch(
      updateFileData(course.id, "ExternalLink", `${response.filename}.url`)
    )
    return createFile(content, fileName, getState, dispatch, courseId)
    //writeFile
    console.log(fileName)
    // dispatch({
    //   type: FILE_DOWNLOAD_FINISHED,
    //   courseid: courseId,
    // })
    // dispatch({
    //   type: UPDATE_COURSE_VISITED_FILES,
    //   courseid: courseId,
    //   visitedFiles: course.visitedFiles + 1,
    // })
    dispatch(fileDownloadFinished(course.id))
    dispatch(updateCourseVisitedFiles(course.id, course.visitedFiles))
    return downloadHandler(dispatch, getState, courseId)
  }
}
