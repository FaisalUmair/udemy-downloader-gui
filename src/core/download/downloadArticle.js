import {
  fileDownloadFinished,
  FILE_DOWNLOAD_FINISHED,
  updateCourseVisitedFiles,
  updateFileData,
  UPDATE_COURSE_VISITED_FILES,
  UPDATE_FILE_TYPE,
  UPDATE_LECTURE_NUMBER,
} from "../../ducks/downloads"
import createFile from "./createFile"
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

export default async function downloadArticle(
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
    const path = `${course.parentPath}/${course.chapter}`
    const extension = ".html"
    const fileName = `${path}/${course.chapterNumber}.${course.lectureNumber} ${item.title}${extension}`
    let content
    if (response.asset.data) {
      content = response.asset.data.body
    } else {
      content = response.asset.body
    }
    console.log(path, fileName, "Article")
    dispatch({
      type: UPDATE_FILE_TYPE,
      courseid: course.id,
      fileType: "Article",
      dlFileName: `${item.title}${extension}`,
    })

    dispatch(updateFileData(course.id, "Article", `${item.title}${extension}`))

    //use fs to write file
    return createFile(content, fileName, getState, dispatch, courseId)

    //from here comment
    console.log(fileName)

    // const downloadObject = getDownloadLink(response, isLecture)
    //why undefined

    //download(downloadLink, filename, path)
    // console.log(video.file, filename)

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
