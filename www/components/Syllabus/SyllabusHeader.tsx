import { useEffect, useState } from "react";
import { IInstitution, ISyllabus } from "types";
import SyllabusMeta from "./SyllabusMeta";
import InstitutionMeta from "./InstitutionMeta";
import { inter } from "app/layout";

interface ISyllabusSchoolCodeYearProps {
  syllabusInfo: ISyllabus,
  isAdmin: boolean,
}

const SyllabusSchoolCodeYear: React.FunctionComponent<
  ISyllabusSchoolCodeYearProps
> = ({ syllabusInfo, isAdmin }) => {
  const [institutions, setInstitutions] = useState<IInstitution[]>([] as IInstitution[])
  const [lang, setLang] = useState<string>()
  const [level, setLevel] = useState<number>()
  const [fields, setFields] = useState<number[]>()
  const [apiUrl, setApiUrl] = useState<URL>()

  useEffect(() => {    
    if (!syllabusInfo) return

    setInstitutions(syllabusInfo.institutions as IInstitution[])
    setLang(syllabusInfo.language)
    setLevel(syllabusInfo.academic_level as number)
    setFields(syllabusInfo.academic_fields)

    setApiUrl(new URL(`/syllabi/${syllabusInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL))
  }, [syllabusInfo])

  return (
    <div className={`flex flex-col gap-2 text-sm mb-4 ${inter.className} text-gray-600`}>
      <div data-cy="institution-info" className="flex flex-col sm:flex-row justify-start md:gap-4">

      <InstitutionMeta institutions={institutions} apiUrl={apiUrl as URL} isAdmin={isAdmin}/>

      </div>
      <div data-cy="syllabus-meta" className="flex flex-col sm:flex-row justify-start md:gap-4">
        <SyllabusMeta lang={lang as string} level={level as number} fields={fields as number[]} apiUrl={apiUrl as URL} isAdmin={isAdmin}/>
      </div>
    </div>
  );
};

export default SyllabusSchoolCodeYear;
