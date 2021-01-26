import mkdirp from "mkdirp"
import downloadHandler from "./downloadHandler"
import {
  NEW_CHAPTER_STARTED,
  UPDATE_COURSE_VISITED_FILES,
  UPDATE_CHAPTER_NUMBER,
  UPDATE_LECTURE_NUMBER,
  updateChapterName,
  updateCourseVisitedFiles,
} from "../../ducks/downloads"
export default function handleChapter(dispatch, getState, courseId, item) {
  const course = getState().downloads[courseId]
  if (!course) return
  const { parentPath, visitedFiles, settings, chapterNumber } = course
  // console.log(getState().downloads[courseId])
  const chapterName = item.title
  const directory = `${parentPath}/${chapterNumber} ${chapterName}`
  // dispatch({
  //   type: NEW_CHAPTER_STARTED,
  //   chapter: chapterName,
  //   courseid: courseId,
  // })


  console.log('We are here', directory)
  dispatch(updateChapterName(course.id, `${chapterNumber} ${chapterName}`))

  return mkdirp(directory).then((res) => {
    // dispatch({
    //   type: UPDATE_COURSE_VISITED_FILES,
    //   courseid: courseId,
    //   visitedFiles: visitedFiles + 1,
    // })
    dispatch(updateCourseVisitedFiles(course.id, visitedFiles))
    downloadHandler(dispatch, getState, courseId)
    return
  })
}
