import downloadItem from "./downloadItem"

export default function handleCaption(dispatch, getState, courseId, item) {
  downloadItem(dispatch, getState, courseId, item)
}
