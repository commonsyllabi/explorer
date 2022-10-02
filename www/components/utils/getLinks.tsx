export const getSyllabiUrl = (uuid: string) => {
  //-- TODO: switch to syllabi
  return "/syllabus/" + uuid;
};

export const getCollectioniUrl = (uuid: string) => {
  return "/collections/" + uuid;
};

export const getUserUrl = (uuid: string) => {
  //-- TODO: switch from user to userS
  return "/user/" + uuid;
};
