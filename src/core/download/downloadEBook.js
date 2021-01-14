import {
  fileDownloadFinished,
  FILE_DOWNLOAD_FINISHED,
  updateCourseVisitedFiles,
  updateFileData,
  UPDATE_COURSE_VISITED_FILES,
  UPDATE_FILE_TYPE,
  UPDATE_LECTURE_NUMBER,
} from "../../ducks/downloads"
import download from "./download"
import downloadHandler from "./downloadHandler"
import urlFetcher from "./urlFetcher"

function getDownloadLink(response, isLecture) {
  if (isLecture) {
    return {
      downloadLink: response.asset.download_urls["E-Book"][0].file,
      fileName: response.asset.filename,
    }
  }
  return {
    downloadLink: response.download_urls["E-Book"][0].file,
    fileName: response.filename,
  }
}

export default async function downloadEBook(
  item,
  dispatch,
  getState,
  courseId,
  isLecture
) {
  const course = getState().downloads[courseId]
  if (!course) return
  let response
  if (isLecture) {
    response = await urlFetcher.lecture(getState, courseId, item.id)
  } else {
    response = await urlFetcher.asset(
      getState,
      courseId,
      item.id,
      item.lectureId
    )
  }

  if (response) {
    let downloadLink, fileName
    const path = `${course.parentPath}/${course.chapter}`

    let downloadObject = getDownloadLink(response, isLecture)
    //why undefined

    // dispatch({
    //   type: UPDATE_FILE_TYPE,
    //   courseid: course.id,
    //   fileType: "E-Book",
    //   dlFileName: downloadObject.fileName,
    // })

    dispatch(updateFileData(course.id, "E-Book", downloadObject.fileName))

    downloadObject = {
      ...downloadObject,
      fileName: `${course.chapterNumber}.${course.lectureNumber} ${downloadObject.fileName}`,
    }

    console.log(isLecture, downloadObject.downloadLink, downloadObject.fileName)

    return download(
      downloadObject.downloadLink,
      downloadObject.fileName,
      path,
      dispatch,
      getState,
      courseId
    )

    console.log(downloadObject.fileName)

    // dispatch({
    //   type: FILE_DOWNLOAD_FINISHED,
    //   courseid: courseId,
    // })
    dispatch(fileDownloadFinished(courseId))
    dispatch(updateCourseVisitedFiles(courseId, course.visitedFiles))
    // dispatch({
    //   type: UPDATE_COURSE_VISITED_FILES,
    //   courseid: courseId,
    //   visitedFiles: course.visitedFiles + 1,
    // })
    return downloadHandler(dispatch, getState, courseId)
  }
}
