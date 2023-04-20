import { useEffect, useState } from "react";
import Image from "next/image";
import removeIcon from '../../public/icons/subtract-line.svg'
import addIcon from '../../public/icons/add-line.svg'

interface IListFieldFormProps {
    name: string,
    data: string[],
    setData: Function,
}

const ListFieldForm: React.FunctionComponent<IListFieldFormProps> = ({ name, data, setData }) => {

    const [tmp, setTmp] = useState(data ? data : [''])
    const nameKey = name.split(' ').join('_').toLowerCase()
    useEffect(() => {
        setData(tmp)
    }, [tmp, setData])

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        const t = e.target;
        tmp[t.dataset.index] = t.value
        setTmp([...tmp])
    }

    const add = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setTmp([...tmp, ''])
    }

    const remove = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const t = e.currentTarget
        const i = t.dataset.index;
        tmp.splice(i, 1)

        setTmp([...tmp])
    }

    return (
        <div className="flex flex-col my-8 gap-2">
            <label htmlFor={nameKey}>{name}</label>
            <ul>
                {tmp.map((r, _index) => (
                    <li className="flex gap-2" key={`${nameKey}-${_index}`} >
                        <textarea className="w-full bg-transparent mt-2 p-1 border border-gray-900" data-index={_index} onChange={handleChange} 
                        data-cy={`${nameKey}-item`} value={r} placeholder={`Add a new item`} />
                        <button data-index={_index} onClick={remove} >
                            <Image src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" />
                        </button>
                    </li>)
                )}
            </ul>
            <button className="w-max text-sm cursor-pointer hover:underline flex items-center gap-2" onClick={add} data-cy={`${nameKey}-add`}>
                <Image src={addIcon} width="24" height="24" alt="Icon to add an element to the list" />
                <div>Add a new item</div>
            </button>
        </div>
    );
};

export default ListFieldForm;