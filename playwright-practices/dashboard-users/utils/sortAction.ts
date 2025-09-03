export const getExpectedSortedDesc = (values: string[]) =>
  [...values].sort((a, b) => {
    if (a === b) return 0;
    if (a < b) return 1;
    return -1;
  });
