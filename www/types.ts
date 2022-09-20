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
  uuid: string;
  name: string;
  country: number;
  date: {
    term?: string;
    year: string;
  };
  url?: string;
  position?: string;
}

export interface ICollection {
  uuid: string;
  name: string;
  status: string;
  description?: string;
  tags: string[];
  syllabi: ISyllabus[];
  user_uuid: string;
}

export interface ISyllabus {
  uuid: string;
  status: string;
  title: string;
  course_number?: string;
  created_at: string;
  institutions?: IInstitution[];
  academic_fields?: number[];
  user_uuid: string;
  user: IUser;
  tags?: string[];
  description: string;
  learning_outcomes?: string;
  attachments?: IResources[];
}

export interface IResources {
  uuid: string;
  name: string;
  url: string;
  description: string;
  type: string;
}

export interface IAttachment {
  id: string;
  name: string;
  description: string;
  file: File;
  url: string;
}
