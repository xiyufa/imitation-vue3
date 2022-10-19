function getSequence(arr = []) {
  let result = []
  let preIndex = []

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      let last = arr[result[result.length - 1]]
      let current = arr[i]
      if (current > last || last === undefined) {
        preIndex[i] = result[result.length - 1]
        result.push(i)
      } else {
        let start = 0
        let end = result.length - 1
        let middle
        while (start < end) {
          middle = Math.floor(((start + end) / 2))
          if (arr[result[middle]] > current) {
            end = middle
          } else {
            start = middle + 1
          }
        }
        if (arr[result[start]] > current) {
          preIndex[i] = result[start - 1]
          result[start] = i
        }
      }
    }
  }

  // 利用前去节点重新计算result
  let i = result.length
  let last = result[i - 1]

  while (i-- > 0) {
    result[i] = last
    last = preIndex[last]
  }

  return result
}


console.log(getSequence([3, 2, 8, 9, 5, 6, 7, 11, 15, 4]))
