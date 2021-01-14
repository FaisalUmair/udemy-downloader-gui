import mkdirp from "mkdirp"
import {
  UPDATE_COURSE_VISITED_FILES,
  NEW_CHAPTER_STARTED,
} from "../../ducks/downloads"
import downloadHandler from "./downloadHandler"
export default function makeDirectory(getState, dispatch, course, chapterName) {
  const { visitedFiles } = course
  const directory = `${course.parentPath}/${chapterName}`
  dispatch({
    type: NEW_CHAPTER_STARTED,
    chapter: chapterName,
    courseid: course.id,
  })
  return mkdirp(directory).then((res) => {
    dispatch({
      type: UPDATE_COURSE_VISITED_FILES,
      courseid: course.id,
      visitedFiles: visitedFiles + 1,
    })
    return downloadHandler(dispatch, getState, course.id)
  })
}
