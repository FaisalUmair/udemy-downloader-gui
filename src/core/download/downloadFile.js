import download from "./download"
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

export default async function downloadFile(item, dispatch, getState, courseId) {
  const response = await urlFetcher.asset(
    getState,
    courseId,
    item.id,
    item.lectureId
  )
  console.log(item)

  const course = getState().downloads[courseId]
  if (!course) return
  if (response) {
    const downloadUrl = response.download_urls["File"][0].file
    const fileName = `${course.chapterNumber}.${course.lectureNumber} ${response.filename}`
    const path = `${course.parentPath}/${course.chapter}`

    // dispatch({
    //   type: UPDATE_FILE_TYPE,
    //   courseid: course.id,
    //   fileType: "File",
    //   dlFileName: response.filename,
    // })

    dispatch(updateFileData(course.id, "File", response.filename))

    // download(downloadUrl, fileName, path);
    return download(downloadUrl, fileName, path, dispatch, getState, courseId)
    // console.log(path, fileName, downloadUrl, "File")

    console.log(fileName)
    // dispatch({
    //   type: FILE_DOWNLOAD_FINISHED,
    //   courseid: courseId,
    // })
    dispatch(fileDownloadFinished(course.id))
    // dispatch({
    //   type: UPDATE_COURSE_VISITED_FILES,
    //   courseid: courseId,
    //   visitedFiles: course.visitedFiles + 1,
    // })
    dispatch(updateCourseVisitedFiles(course.id, course.visitedFiles))
    return downloadHandler(dispatch, getState, courseId)
  }
}
