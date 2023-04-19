import Link from "next/link";
import * as React from "react";
import SyllabusCreationStatus from "./SyllabusCreationStatus";
import InstitutionCreationStatus from "./InstitutionCreationStatus";
import AttachmentsCreationStatus from "./AttachmentsCreationStatus";

interface ISyllabusProcessingProps {
    syllabusCreated: string;
    attachmentsCreated: string;
    institutionCreated: string;
    syllabusUUID: string;
    handleClick: Function;
}

const SyllabusProcessing: React.FunctionComponent<ISyllabusProcessingProps> = ({ syllabusCreated, attachmentsCreated, institutionCreated, syllabusUUID, handleClick }) => (<>
    <div className="w-11/12 md:w-10/12 m-auto mt-8">
        <div className="pt-3 pb-3">
            <div className="col-8 offset-2">
                {syllabusCreated === "created" &&
                    attachmentsCreated === "created" &&
                    institutionCreated === "created" ? (
                    <>
                        <h1 className="text-2xl my-8">Success!</h1>
                        <div>
                            View your syllabus
                            <Link href={`/syllabus/${syllabusUUID}`} className="underline">
                                here
                            </Link>
                            .
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl my-8">Saving...</h1>
                        <ul>
                            <SyllabusCreationStatus status={syllabusCreated} />
                            <InstitutionCreationStatus status={institutionCreated} />
                            <AttachmentsCreationStatus status={attachmentsCreated} />
                        </ul>
                        <button onClick={() => handleClick()} className="mt-8 underline cursor-pointer">Back to editing</button>
                    </>
                )}
            </div>
        </div>
    </div>
</>);

export default SyllabusProcessing;
