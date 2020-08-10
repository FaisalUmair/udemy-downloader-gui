import axios from 'axios';


export default function (accessToken, courseid) {
    return axios
        .get(`https://www.udemy.com/api-2.0/courses/${courseid}/cached-subscriber-curriculum-items?page_size=100000`, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
}