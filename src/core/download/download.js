import Downloader from "mt-files-downloader"
import fs from "fs"
import vtt2srt from "node-vtt-to-srt"
import mkdirp from "mkdirp";
import {
  downloaderStarted,
  DOWNLOAD_PAUSED,
  DOWNLOAD_STARTED,
  fileDownloadFinished,
  FILE_DOWNLOAD_FINISHED,
  pauseDownload,
  updateCourseVisitedFiles,
  updateDownloaderProgress,
  updateDownloaderStatus,
  UPDATE_COURSE_VISITED_FILES,
  UPDATE_PROGRESS,
} from "../../ducks/downloads"
import downloadHandler from "./downloadHandler"
import axios from "axios"
export default function download(
  url,
  fileName,
  path,
  dispatch,
  getState,
  courseId,
  isCaption = false,
  retries = 0
) {
  const course = getState().downloads[courseId]

  const retryCount = 5

  let downloader;

  if (fs.existsSync(`${path}/${fileName}.mtd`)) {
    downloader = new Downloader().resumeDownload(`${path}/${fileName}`)
    downloader.setUrl(url)
  } else {

    const file = `${path}/${fileName}`

    if(!fs.existsSync(path)){
      mkdirp.sync(path);
    }

    downloader = new Downloader().download(url, file)
  }

  downloader.start()

  const interval = setInterval(() => {
    console.log(downloader.status)
    if (!course) {
      return clearInterval(interval)
    }
    switch (downloader.status) {
      case -1:
        clearInterval(interval)
        axios
          .head(url)
          .then((res) => {
            switch (res.status) {
              case 200:
                if (retries <= retryCount) {
                  download(
                    url,
                    fileName,
                    path,
                    dispatch,
                    getState,
                    courseId,
                    isCaption,
                    retries + 1
                  )
                }
                return
                break
              default:
                dispatch(pauseDownload(courseId))
                dispatch(updateDownloaderStatus(courseId, "error"))
                return
            }
          })
          .catch((err) => {
            switch (err.status) {
              case 404:
                dispatch(fileDownloadFinished(courseId))
                dispatch(
                  updateCourseVisitedFiles(courseId, course.visitedFiles)
                )
                downloadHandler(dispatch, getState, courseId)
                return
                break
              default:
                dispatch(pauseDownload(courseId))
                dispatch(updateDownloaderStatus(courseId, "error"))
                return
            }
          })
        break
      case 1:
        // dispatch({
        //   type: UPDATE_PROGRESS,
        //   courseid: courseId,
        //   currentProgress: downloader.getStats().total.completed,
        // })
        dispatch(
          updateDownloaderProgress(
            courseId,
            downloader.getStats().total.completed
          )
        )
        break
      case -2:
        // dispatch({
        //   type: UPDATE_PROGRESS,
        //   courseid: courseId,
        //   currentProgress: downloader.getStats().total.completed,
        // })
        dispatch(
          updateDownloaderProgress(
            courseId,
            downloader.getStats().total.completed
          )
        )

        // dispatch({ type: DOWNLOAD_PAUSED, courseid: courseId })
        dispatch(updateDownloaderStatus(courseId, "paused"))
        clearInterval(interval);
        break
      case 3:
        // dispatch({
        //   type: UPDATE_PROGRESS,
        //   courseid: courseId,
        //   currentProgress: downloader.getStats().total.completed,
        // })
        dispatch(
          updateDownloaderProgress(
            courseId,
            downloader.getStats().total.completed
          )
        )

        clearInterval(interval)
        break
      default:
        // dispatch({
        //   type: UPDATE_PROGRESS,
        //   courseid: courseId,
        //   currentProgress: downloader.getStats().total.completed,
        // })
        dispatch(
          updateDownloaderProgress(
            courseId,
            downloader.getStats().total.completed
          )
        )
    }
  }, 1000)

  downloader.on("start", () => {
    // dispatch({ type: DOWNLOAD_STARTED, courseId, downloadInstance: downloader })
    dispatch(downloaderStarted(courseId, downloader))
  })

  downloader.on("end", () => {
    if (!course) return

    if (isCaption) {
      let fn = `${path}/${fileName}`
      const lastIndex = fn.lastIndexOf(".")
      fn = fn.slice(0, lastIndex)
      fs.createReadStream(`${path}/${fileName}`)
        .pipe(vtt2srt())
        .pipe(fs.createWriteStream(`${fn}.srt`))
      fs.unlinkSync(`${path}/${fileName}`)
    }
    // dispatch({
    //   type: FILE_DOWNLOAD_FINISHED,
    //   courseid: courseId,
    // })
    dispatch(fileDownloadFinished(courseId))
    // dispatch({
    //   type: UPDATE_COURSE_VISITED_FILES,
    //   courseid: courseId,
    //   visitedFiles: course.visitedFiles + 1,
    // })
    dispatch(updateCourseVisitedFiles(courseId, course.visitedFiles))
    downloadHandler(dispatch, getState, courseId)
    return
  })
}
