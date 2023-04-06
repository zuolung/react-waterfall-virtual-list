export function getClosestIndex_(rects, scrollTop) {
  let start = 0;
  let end = rects.length - 1;
  let resIndex = undefined;

  while (start <= end) {
    const midIndex = Math.floor((start + end) / 2);
    const midValue = rects[midIndex].top;

    if (midValue === scrollTop) {
      return resIndex;
    }

    if (midValue < scrollTop) {
      if (resIndex === undefined || resIndex < midIndex) {
        resIndex = midIndex;
      }

      start = midIndex + 1;
    }

    if (midValue > scrollTop) {
      end = midIndex - 1;
    }
  }

  resIndex = resIndex || 0;

  return resIndex;
}
