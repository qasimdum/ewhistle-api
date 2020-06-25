const allegationStatusEnum = {
  INITIAL: 0,
  IN_REVIEW: 1,
  RESOLVED: 2
};
const getStatusTitle = (status) => {
  const titles = {
    [allegationStatusEnum.INITIAL]: 'Initial',
    [allegationStatusEnum.IN_REVIEW]: 'In Review',
    [allegationStatusEnum.RESOLVED]: 'Resolved',
  };

  return titles[status];
};
module.exports = {allegationStatusEnum, getStatusTitle};
