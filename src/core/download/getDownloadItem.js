export default function getDownloadItem(course) {
  const { curriculum, visitedFiles } = course

  const target = visitedFiles + 1

  let count = 0

  for (let item of curriculum) {
    count++

    if (count === target) {
      return item
    }

    if (item.asset && item.asset.caption) {
      count++
      if (count === target) return { ...item.asset.caption, lectureId: item.id }
    }

    if (item.supplementary_assets) {
      for (let suppItem of item.supplementary_assets) {
        count++
        if (count === target) {
          return { ...suppItem, lectureId: item.id }
        }
      }
    }
  }
  // const { curriculum, visitedFiles: visited } = course

  // let count = 0
  // let index = 0
  // while (count <= visited) {
  //   const curriculi = curriculum[index]
  //   if (curriculi._class == "chapter") {
  //     if (count == visited) {
  //       count++
  //       return curriculi
  //     } else {
  //       count++
  //     }
  //   }

  //   if (curriculi._class == "lecture") {
  //     if (curriculi.supplementary_assets.length > 0) {
  //       for (let j = 0; j < curriculi.supplementary_assets.length; j++) {
  //         const supp = curriculi.supplementary_assets[j]
  //         if (count == visited) {
  //           count++
  //           return supp
  //         } else {
  //           count++
  //         }
  //       }
  //     }
  //     if (count == visited) {
  //       count++
  //       return curriculi
  //     } else {
  //       count++
  //     }
  //   }
  //   index++
  // }
}
