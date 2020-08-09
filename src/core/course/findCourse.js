import axios from 'axios';


export default function (accessToken, search, pageNumber = 1) {
    return axios
        .get('https://www.udemy.com/api-2.0/users/me/subscribed-courses?page_size=20&search=' + search + '&page=' + pageNumber, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
}