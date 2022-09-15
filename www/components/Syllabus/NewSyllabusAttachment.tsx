import { Container, Badge, Form, Tabs, Tab, Button } from "react-bootstrap";
import { useState } from 'react';

interface IAttachment {
    id: string,
    name: string,
    description: string,
    file: File,
    url: string
}

interface INewSyllabusAttachmentProps {
    attachment: IAttachment,
    updateData: Function,
    removeAttachment: Function,
}

const NewSyllbusAttachment: React.FunctionComponent<INewSyllabusAttachmentProps> = ({
    attachment,
    updateData,
    removeAttachment,
}) => {

    const [attachmentData, setAttachmentData] = useState(attachment)
    const [fileData, setFileData] = useState({
        name: "",
        size: "",
        type: "",
    })

    const handleAttachmentName = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        const t = event.target as HTMLInputElement
        setAttachmentData({ ...attachment, name: t.value })
        updateData(attachmentData)
    }

    const handleAttachmentDescription = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        const t = event.target as HTMLInputElement
        setAttachmentData({ ...attachment, description: t.value })
        updateData(attachmentData)
    }

    const handleAttachmentFile = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        const t = event.target as HTMLInputElement
        if (t.files == null) return

        const f = t.files[0] as File
        setAttachmentData({ ...attachment, file: f })

        setFileData({
            name: f.name,
            size: (f.size * 0.000001).toFixed(2), //-- from byte to megabyte
            type: f.type
        })
        updateData(attachmentData)
    };

    const handleAttachmentURL = (event: React.SyntheticEvent): void => {
        event.preventDefault()

        const t = event.target as HTMLInputElement
        setAttachmentData({ ...attachment, url: t.value })
        updateData(attachmentData)
    }

    const handleRemoveAttachment = (): void => {
        removeAttachment(attachmentData.id)
    }

    return (
        <>
            <div className="course-attachments p-3 mb-3 border rounded bg-light">
                <div className="attachment-item">
                    {fileData.name == "" ? (
                        <></>
                    ) : (
                        <>
                            <h4 className="h5">{fileData.name}</h4>
                            <div className="d-flex">
                                <p className="mb-0">Size: {fileData.size} Mb</p>
                                <p className="mx-3">|</p>
                                <p>
                                    Type: <Badge bg="secondary">{fileData.type}</Badge>
                                </p>
                            </div>
                        </>
                    )}
                    <div className="gap-3">
                        <Form.Group>
                            <Form.Label>
                                Name*
                            </Form.Label>
                            <Form.Control onChange={handleAttachmentName} type="text" id="name" placeholder="required"/>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>
                                Description
                            </Form.Label>
                            <Form.Control onChange={handleAttachmentDescription} type="text" id="description" placeholder="optional"/>
                        </Form.Group>

                        <Tabs defaultActiveKey="File" className="mt-3">
                            <Tab eventKey="File" title="File">
                                <Form.Group>
                                    <Form.Label>
                                        Upload your file here
                                    </Form.Label>
                                    <Form.Control onChange={handleAttachmentFile} type="file" id="file" />
                                </Form.Group>
                            </Tab>
                            <Tab eventKey="URL" title="URL">
                                <Form.Group>
                                    <Form.Label>
                                        Enter your URL here
                                    </Form.Label>
                                    <Form.Control onChange={handleAttachmentURL} type="text" id="url" />
                                </Form.Group>
                            </Tab>
                        </Tabs>
                    </div>
                    <Button variant="danger" size="sm" className="m-3" onClick={handleRemoveAttachment}>
                        Remove
                    </Button>
                </div>
            </div>
        </>
    )
}

export default NewSyllbusAttachment;