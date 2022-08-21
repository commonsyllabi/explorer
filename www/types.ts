export interface IUser {
  uuid: string;
  name: string;
  bio: string;
  urls?: string[];
  education?: string | object[];
  institutions?: object[];
  collections?: object[];
  syllabi?: object[];
}

export interface IInstitution {
  name: string;
  position: string;
}

export interface ISyllabus {
  uuid: string;
  name: string;
}
