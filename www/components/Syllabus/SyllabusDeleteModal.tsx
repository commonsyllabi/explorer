import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import React, { useState } from "react";
import { ISyllabus } from "types";
import Image from "next/image";
import cancelIcon from '../../public/icons/close-line.svg'

interface ISyllabusDeleteProps {
    syllabusInfo: ISyllabus,
    handleClose: Function
}

const SyllabusDeleteModal: React.FunctionComponent<ISyllabusDeleteProps> = ({ syllabusInfo, handleClose }) => {

    const {data: session} = useSession()
    const [log, setLog] = useState('')
    const handleCloseButton = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        handleClose()
    }

    const deleteSyllabus = () => {
        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);
    
        fetch(new URL(`/syllabi/${syllabusInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL),
          {
            method: 'DELETE',
            headers: h
          })
          .then(res => {
            if (res.ok) {
              setLog(`${syllabusInfo.title} was successfully deleted!`)
              Router.reload()
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
            setLog(`There was an error deleting your syllabus (${body}). Please try again later.`)
          })
      }

    return (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-50/80">
        <div className="relative md:w-6/12 bg-gray-50 border-2 border-gray-900 rounded-lg p-8">
            <h2 className="text-xl font-bold mb-4">Watch out!</h2>
            <div>You are about to delete <b>{syllabusInfo.title}</b>.</div>
            
            <div className="flex justify-content-between mt-3">
            <button onClick={deleteSyllabus} className="mt-3 flex p-2 bg-red-500 hover:bg-red-600 text-white rounded-md gap-3" >
                <div>Delete syllabus</div>
              </button>
            <button onClick={handleCloseButton} className="absolute top-2 right-2">
                <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" /></button>
            </div>
        </div>
        </div>
    )
}

export default SyllabusDeleteModal;