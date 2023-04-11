export interface IUser {
  uuid: string;
  name: string;
  email: string;
  bio?: string;
  urls?: string[];
  education?: string[];
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

export interface IFormInstitution {
  name: string;
  country: string;
  date_term: string;
  date_year: string;
  url: string;
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
  language: string;
  academic_fields: number[];
  academic_level?: number;
  user_uuid: string;
  user: IUser;
  tags?: string[];
  description: string;
  learning_outcomes?: string;
  attachments?: IResources[];
  collections?: ICollection[];
}

export interface IFormData {
  institutions: IInstitution[];
  title: string;
  course_number: string;
  description: string;
  attachments: IAttachment[];
  tags: string[];
  language: string;
  learning_outcomes: string[];
  topic_outlines: string[];
  readings: string[];
  grading_rubric: string;
  assignments: string[];
  other: string;
  status: string;
  academic_fields: string[];
  academic_level: number;
  duration: number;
}

export interface IParsedData { 
  data: IFormDataOptional;
  attachment: File;
}

// Makes all fields optional and allows for partial updates
export interface IFormDataOptional extends Partial<IFormData> {}

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

export interface IUploadAttachment {
  id: number;
  name: string;
  description?: string;
  file?: File;
  size?: string;
  url?: string;
  type?: string;
}

export interface ISyllabiFilters {
  academic_level: string;
  academic_field: string;
  academic_year: string;
  language: string;
  tags_include: string[];
  tags_exclude: string[];
}

export interface IMetaInformation {
  total_pages: number,
  total_syllabi: number,
  languages: string[],
  academic_fields: string[],
  academic_levels: string[],
  academic_years: string[],
}