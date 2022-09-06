export const getIsPublic = (status: string) => {
  if (status === "unlisted") {
    return false;
  } else if (status === "listed") {
    return true;
  }
  return null;
};
