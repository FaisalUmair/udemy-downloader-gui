import downloadHandler from "./downloadHandler"

import {
  FILE_DOWNLOAD_FINISHED,
  UPDATE_COURSE_VISITED_FILES,
} from "../../ducks/downloads"
import downloadItem from "./downloadItem"
export default function handleLecture(dispatch, getState, courseId, item) {
  downloadItem(dispatch, getState, courseId, item)

  // switch (item.asset.asset_type) {
  //   case "Video":
  //     console.log("Video", item.id)
  //     break
  //   case "Article":
  //     console.log("Article", item.id)
  //     break
  //   case "E-Book":
  //     console.log("E-Book", item.id)
  //     break
  //   case "Url":
  //     console.log("Url", item.id)
  //     break
  // }

  // dispatch({
  //   type: FILE_DOWNLOAD_FINISHED,
  //   courseid: courseId,
  // })
  // dispatch({
  //   type: UPDATE_COURSE_VISITED_FILES,
  //   courseid: courseId,
  //   visitedFiles: visitedFiles + 1,
  // })
  // return downloadHandler(dispatch, getState, courseId)
}
