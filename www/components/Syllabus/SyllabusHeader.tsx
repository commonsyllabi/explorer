import { useEffect, useState } from "react";
import { IInstitution, ISyllabus } from "types";
import SyllabusMeta from "./SyllabusMeta";
import InstitutionMeta from "./InstitutionMeta";
import { inter } from "app/layout";

interface ISyllabusSchoolCodeYearProps {
  syllabusInfo: ISyllabus,
}

const SyllabusSchoolCodeYear: React.FunctionComponent<
  ISyllabusSchoolCodeYearProps
> = ({ syllabusInfo }) => {
  const [institutions, setInstitutions] = useState<IInstitution[]>([] as IInstitution[])
  const [lang, setLang] = useState<string>()
  const [level, setLevel] = useState<number>()
  const [fields, setFields] = useState<number[]>()

  useEffect(() => {    
    if (!syllabusInfo) return

    setInstitutions(syllabusInfo.institutions as IInstitution[])
    setLang(syllabusInfo.language)
    setLevel(syllabusInfo.academic_level as number)
    setFields(syllabusInfo.academic_fields)

  }, [syllabusInfo])

  return (
    <div className={`md:w-full flex flex-col gap-6 md:gap-2 md:text-sm mb-4 ${inter.className} text-gray-600`}>
      <div data-cy="institution-info" className="flex flex-col sm:flex-row justify-start md:gap-4">

      <InstitutionMeta institutions={institutions} onSuccess={(_i: IInstitution) => setInstitutions([_i])}/>

      </div>
      <div data-cy="syllabus-header" className="w-full  flex flex-col sm:flex-row justify-start md:gap-4">
        <SyllabusMeta lang={lang as string} level={level as number} fields={fields as number[]} onSuccess={(_u: ISyllabus) => {
          setLang(_u.language); setFields(_u.academic_fields); setLevel(_u.academic_level)
        }}/>
      </div>
    </div>
  );
};

export default SyllabusSchoolCodeYear;
