export const getAcademicLevelText = (level: number | undefined) => {
  if (level === undefined) {
    return null;
  }
  switch (level) {
    case 0:
      return "Other";
    case 1:
      return "Bachelor's";
    case 2:
      return "Master's";
    case 3:
      return "Doctoral";
    default:
      return null;
  }
};
