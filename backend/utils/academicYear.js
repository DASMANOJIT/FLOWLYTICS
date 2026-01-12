export const getAcademicYear = () => {
  const now = new Date();
  // March → December = current year
  // Jan–Feb = previous academic year
  return now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1;
};

export const isFebruary = () => {
  return new Date().getMonth() === 1;
};
