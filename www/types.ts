export interface IUser {
  uuid: string;
  name: string;
  bio?: string;
  urls?: string[];
  education?: string | string[];
  institutions?: IInstitution[];
  syllabi?: ISyllabus[];
  collections?: ICollection[];
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
  syllabi: ISyllabus[];
}

export interface ISyllabus {
  uuid: string;
  institution?: string;
  course_number?: string;
  term?: string;
  year?: string;
  title: string;
  status: string;
  user: IUser;
  user_uuid: string;
  description: string;
  tags?: string[];
}

export interface IResources {
  uuid: string;
  name: string;
  url: string;
  description: string;
  type: string;
}
