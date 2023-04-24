import { createContext, useContext } from "react";

type editContextType = {
    isOwner: boolean,
    userUUID?: string,
    syllabusUUID?: string,
    collectionUUID?: string,
}

export const EditContext = createContext<editContextType>({isOwner: false});

export function useEdit() {
    return useContext(EditContext);
}
