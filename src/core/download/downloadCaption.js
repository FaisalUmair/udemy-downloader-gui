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

export default async function downloadCaption(
  item,
  dispatch,
  getState,
  courseId
) {
  const course = getState().downloads[courseId]
  if (!course) return

  const response = await urlFetcher.caption(
    getState,
    courseId,
    // item.id,
    item.lectureId
  )

  if (response) {
    console.log(response)
    const found = response.captions.find((caption) => caption.id === item.id)
    // console.log(course.chapter)

    const lastIndex = response.filename.lastIndexOf(".")
    const fileName = `${course.chapterNumber}.${
      course.lectureNumber
    } ${response.filename.slice(0, lastIndex)}.vtt`

    const path = `${course.parentPath}/${course.chapter}`
    const downloadUrl = found.url

    console.log(path, fileName)

    dispatch({
      type: UPDATE_FILE_TYPE,
      courseid: course.id,
      fileType: "Subtitle",
      dlFileName: `${response.filename.slice(0, lastIndex)}.srt`,
    })

    dispatch(
      updateFileData(
        course.id,
        "Subtitle",
        `${response.filename.slice(0, lastIndex)}.srt`
      )
    )
    return download(
      downloadUrl,
      fileName,
      path,
      dispatch,
      getState,
      courseId,
      true
    )

    console.log(fileName)
    dispatch(fileDownloadFinished(course.id))
    dispatch(updateCourseVisitedFiles(course.id, course.visitedFiles))
    // dispatch({
    //   type: FILE_DOWNLOAD_FINISHED,
    //   courseid: courseId,
    // })
    // dispatch({
    //   type: UPDATE_COURSE_VISITED_FILES,
    //   courseid: courseId,
    //   visitedFiles: course.visitedFiles + 1,
    // })
    return downloadHandler(dispatch, getState, courseId)
  }
}
