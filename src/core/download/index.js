// import downloadLecture from './downloadLecture';


// export { downloadLecture }

import Downloader from 'mt-files-downloader';


import { DOWNLOAD_STARTED, DOWNLOAD_PAUSED, UPDATE_PROGRESS } from '../../ducks/downloads'


export const download = (courseid, dispatch, getState) => {

    const course = getState().downloads[courseid];


    if (course.downloadInstance) {
        course.downloadInstance.resume()
    } else {
        const downloader = new Downloader().download('http://212.183.159.230/5MB.zip', '/Users/faisalumair/Dev/udemy-downloader-react/src/core/download/test.bin');
        downloader.start();


        downloader.on('start', () => {
            dispatch({ type: DOWNLOAD_STARTED, courseid, downloadInstance: downloader })
        })

        const interval = setInterval(() => {
            console.log('Interval')
            switch (downloader.status) {
                case 1:
                    dispatch({ type: UPDATE_PROGRESS, courseid, currentProgress: downloader.getStats().total.completed })
                    break;
                case -2:
                    dispatch({ type: UPDATE_PROGRESS, courseid, currentProgress: downloader.getStats().total.completed })
                    dispatch({ type: DOWNLOAD_PAUSED, courseid })
                    break;
                case 3:
                    dispatch({ type: UPDATE_PROGRESS, courseid, currentProgress: downloader.getStats().total.completed })
                    clearInterval(interval)
                    break;
                default:
                    console.log(downloader.status)
                    dispatch({ type: UPDATE_PROGRESS, courseid, currentProgress: downloader.getStats().total.completed })
            }
        }, 1000);


        downloader.on('error', () => {
            dispatch({ type: DOWNLOAD_PAUSED, courseid })
            clearInterval(interval)
        })





    }

    // if (course.downloadInstance) {
    //     console.log('Resume')
    //     course.downloadInstance.download('https://speed.hetzner.de/100MB.bin', './test.bin');
    // } else {
    //     console.log('Start')
    //     console.log(course);
    //     dispatch({ type: "UPDATE_COURSE", course: { ...course, downloadInstance: new Downloader() } })
    //     course.downloadInstance.download('https://speed.hetzner.de/100MB.bin', './test.bin');
    // }
}