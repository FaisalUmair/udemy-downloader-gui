import downloadHandler from "./downloadHandler"
import {
  FILE_DOWNLOAD_FINISHED,
  UPDATE_COURSE_VISITED_FILES,
} from "../../ducks/downloads"
import downloadItem from "./downloadItem"

export default function handleAsset(dispatch, getState, courseId, item) {
  downloadItem(dispatch, getState, courseId, item)
}
