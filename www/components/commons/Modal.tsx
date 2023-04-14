import * as React from "react";

interface ModalProps{}

const Modal: React.FunctionComponent<ModalProps> = (props: React.PropsWithChildren<ModalProps>) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-50/80">
            <div className="relative md:w-6/12 m-2 bg-gray-50 border-2 border-gray-900 rounded-lg p-8">
                {props.children}
            </div>
        </div>
    );
};

export default Modal;