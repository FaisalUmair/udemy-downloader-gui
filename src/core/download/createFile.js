import {
  fileDownloadFinished,
  FILE_DOWNLOAD_FINISHED,
  updateCourseVisitedFiles,
  UPDATE_COURSE_VISITED_FILES,
} from "../../ducks/downloads"

import downloadHandler from "./downloadHandler"
const fs = require("fs")

export default function createFile(
  content,
  fileName,
  getState,
  dispatch,
  courseId
) {
  const course = getState().downloads[courseId]
  return fs.writeFile(fileName, content, (err) => {
    if (err) return console.error(err)
    // console.log("Article Written", fileName)
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

    downloadHandler(dispatch, getState, courseId)
    return;
  })
}
