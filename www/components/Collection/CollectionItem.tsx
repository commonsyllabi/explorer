import { getSyllabusCards } from "components/utils/getSyllabusCards";
import { EditContext } from "context/EditContext";
import { useContext, useState } from "react";
import { ISyllabus } from "types";
import removeIcon from '../../public/icons/subtract-line.svg'
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";

interface ICollectionItemProps {
    syllabusInfo: ISyllabus;
}

const CollectionItem: React.FunctionComponent<ICollectionItemProps> = ({
    syllabusInfo,
}) => {
    const ctx = useContext(EditContext)
    const { data: session, status } = useSession();
    const [log, setLog] = useState('')

    const confirmRemoveMsg = `Do you really want to remove ${syllabusInfo.title} from this collection? This action cannot be undone.`

    const default_filters = {
        academic_level: "",
        academic_field: "",
        academic_year: "",
        language: "",
        tags_include: [],
        tags_exclude: [],
    }

    const handleRemove = (syll_uuid: string) => {
        if(!ctx.collectionUUID) return;
        
        const removeUrl = new URL(`/collections/${ctx.collectionUUID}/syllabi/${syll_uuid}`, process.env.NEXT_PUBLIC_API_URL)

        if (!window.confirm(confirmRemoveMsg))
            return

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        fetch(removeUrl, {
            method: 'DELETE',
            headers: h,
        })
            .then((res) => {
                if (res.ok) {
                    Router.reload();
                } else if (res.status == 401) {
                    signOut({ redirect: false }).then((result) => {
                        Router.push("/auth/signin");
                    })
                    return res.text()
                } else {
                    return res.text()
                }
            })
            .then(body => {
                setLog(`An error occured while deleting: ${body}`)
            })
    }

    return (<>
        <div data-cy="collection-item" key={syllabusInfo.uuid} className="flex gap-1">
            {getSyllabusCards([syllabusInfo], default_filters)}
            <div className="border-2 border-gray-900 p-2 rounded-md flex items-center">
                <button data-cy="remove-from-collection" className="h-full" onClick={() => { handleRemove(syllabusInfo.uuid) }}>
                    <Image src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" />
                </button>
            </div>
        </div>
    </>)
}

export default CollectionItem;