import { NextPage } from "next";

const Contact: NextPage = () => {
    return (
        <div className="w-11/12 md:w-10/12 m-auto my-8">
            <h1 className="text-3xl my-8">CONTACT</h1>
            <p>For any inquiries, questions, contributions you can contact us at:</p>
            <p className="w-max my-4 text-lg font-bold underline"><a href="mailto:admin@mail.cosyll.org">admin@mail.cosyll.org</a></p>
        </div>
    )
}

export default Contact;
