import {
  FILE_DOWNLOAD_FINISHED,
  UPDATE_CHAPTER_NUMBER,
  UPDATE_COURSE_VISITED_FILES,
  UPDATE_LECTURE_NUMBER,
  updateChapterNumber,
  updateLectureNumber,
} from "../../ducks/downloads"
import downloadHandler from "./downloadHandler"
import handleChapter from "./handleChapter"
import handleLecture from "./handleLecture"
import handleAsset from "./handleAsset"
import handleCaption from "./handleCaption"
import getDownloadItem from "./getDownloadItem"

export default function handleItem(getState, dispatch, course) {
  if (!course) return
  const { curriculum } = course
  let count = 0
  // console.log(
  //   course.downloaded,
  //   course.total,
  //   course.visitedFiles
  //   // getState().downloads
  // )

  const item = getDownloadItem(course)


  console.log(item)

  switch (item._class) {
    case "chapter":
      // dispatch({
      //   type: UPDATE_CHAPTER_NUMBER,
      //   courseid: course.id,
      //   chapterNumber: course.chapterNumber + 1,
      // })
      // dispatch({
      //   type: UPDATE_LECTURE_NUMBER,
      //   courseid: course.id,
      //   lectureNumber: 0,
      // })
      //dispatch(updateChapterNumber(course.id, course.chapterNumber))
      return handleChapter(dispatch, getState, course.id, item)
    case "asset":
      return handleAsset(dispatch, getState, course.id, item)
    case "lecture":
      dispatch(updateLectureNumber(course.id, course.lectureNumber))
      return handleLecture(dispatch, getState, course.id, item)
    case "caption":
      //handle caption here
      return handleCaption(dispatch, getState, course.id, item)
  }
  return downloadHandler(dispatch, getState, course.id)
}
