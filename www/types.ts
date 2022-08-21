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

export interface ICollection {
  uuid: string;
  name: string;
  status: string;
  description?: string;
  tags: string[];
}

export interface ISyllabus {
  uuid: string;
  title: string;
  status: string;
  description: string;
  tags: string[];
}
