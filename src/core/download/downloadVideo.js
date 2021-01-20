import {
  fileDownloadFinished,
  FILE_DOWNLOAD_FINISHED,
  updateCourseVisitedFiles,
  updateFileData,
  UPDATE_COURSE_VISITED_FILES,
  UPDATE_FILE_TYPE,
  UPDATE_LECTURE_NUMBER,
  UPDATE_VIDEO_QUALITY,
} from "../../ducks/downloads"
import download from "./download"
import downloadHandler from "./downloadHandler"
import urlFetcher from "./urlFetcher"

function getVideoItemByQuality(videosResponse, course) {
  let matched = videosResponse.find(
    (video) => video.label == course.settings.lectureQuality
  )

  if (!matched) {
    const videos = videosResponse
      .filter((video) => video.label != "Auto")
      .reverse()

    for (let i = 0; i < videos.length; i++) {
      if (
        parseInt(videos[i].label) > parseInt(course.settings.lectureQuality)
      ) {
        return videos[i]
      }
    }
    matched = videos[videos.length - 1]
  }
  return matched
}

export default async function downloadVideo(
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
    const { filename, stream_urls } = response.asset
    const videoResponse = stream_urls.Video
    const video = getVideoItemByQuality(videoResponse, course)
    console.log(video)
    const path = `${course.parentPath}/${course.chapter}`
    const downloadLink = video.file
    const fn = `${course.chapterNumber}.${course.lectureNumber} ${filename}`
    // dispatch({
    //   type: UPDATE_FILE_TYPE,
    //   courseid: course.id,
    //   fileType: "Video",
    //   dlFileName: filename,
    // })
    // console.log(video.label)
    // dispatch({
    //   type: UPDATE_VIDEO_QUALITY,
    //   courseid: course.id,
    //   videoQuality: video.label,
    // })
    
    dispatch(updateFileData(course.id, "Video", filename, video.label))

    return download(downloadLink, fn, path, dispatch, getState, courseId)

    //console.log(fn)
    //dispatch(fileDownloadFinished(course.id))
    // dispatch({
    //   type: FILE_DOWNLOAD_FINISHED,
    //   courseid: courseId,
    // })
    // dispatch({
    //   type: UPDATE_COURSE_VISITED_FILES,
    //   courseid: courseId,
    //   visitedFiles: course.visitedFiles + 1,
    // })
    // dispatch(updateCourseVisitedFiles(course.id, course.visitedFiles))
    // return downloadHandler(dispatch, getState, courseId)
  }
}
