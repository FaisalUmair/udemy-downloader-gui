import axios from 'axios';


export default function (accessToken, pageNumber = 1) {
    return axios
        .get('https://www.udemy.com/api-2.0/users/me/subscribed-courses?page_size=20&page=' + pageNumber, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
}