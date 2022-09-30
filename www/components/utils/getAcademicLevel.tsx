export const getAcademicLevelText = (level: number | undefined) => {
  if (level === undefined) {
    return null;
  }
  switch (level) {
    case 0:
      return "Other";
    case 1:
      return "Bachelor's Level";
    case 2:
      return "Master's Level";
    case 3:
      return "Doctora Level";
    default:
      return null;
  }
};
