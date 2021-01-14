import axios from "axios"

export default function (accessToken, courseid) {
  return axios.get(
    `https://www.udemy.com/api-2.0/courses/${courseid}/cached-subscriber-curriculum-items?page_size=100000&fields[lecture]=asset,supplementary_assets,title&fields[asset]=captions,asset_type&fields[caption]=source,locale_id,video_label`,
    {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  )
}
