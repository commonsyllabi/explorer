import { Container, Badge, Form, Tabs, Tab, Button } from "react-bootstrap";
import { useState } from 'react';

interface INewSyllabusAttachmentProps {
    attachment: object,
    updateData: Function,
}

const NewSyllbusAttachment: React.FunctionComponent<INewSyllabusAttachmentProps> = ({
    attachment,
    updateData,
}) => {

    const [attachmentData, setAttachmentData] = useState(attachment)
    
    const handleAttachmentName = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        const t = event.target as HTMLInputElement
        setAttachmentData({ ...attachment, name: t.value })
        updateData(attachmentData)
    }

    const handleAttachmentFile = (event: React.SyntheticEvent): void => {
        event.preventDefault();

        const t = event.target as HTMLInputElement

        if (t.files != null)
            setAttachmentData({ ...attachment, file: t.files[0] as File })
        updateData(attachmentData)
    };

    const handleAttachmentURL = (event: React.SyntheticEvent): void => {
        event.preventDefault()

        const t = event.target as HTMLInputElement
        setAttachmentData({ ...attachment, url: t.value })
        updateData(attachmentData)
    }

    return (
        <Container>
            <div className="course-attachments p-3 mb-3 border rounded bg-light">
                <div className="attachment-item">
                    <h4 className="h5">AttachmentName.pdf</h4>
                    <div className="d-flex">
                        <p className="mb-0">Size: 3.5mb</p>
                        <p className="mx-3">|</p>
                        <p>
                            Type: <Badge bg="secondary">PDF</Badge>
                        </p>
                    </div>
                    <p>
                        This is the description of my attachment, which is a
                        pdf.
                    </p>
                    <div className="d-flex gap-3">

                        <Form className="attachment-inputs" id="attachment-input">
                            <Form.Group>
                                <Form.Label>
                                    Name
                                </Form.Label>
                                <Form.Control onChange={handleAttachmentName} type="text" id="name" className=".attachment-names" />
                            </Form.Group>

                            <Tabs defaultActiveKey="File">
                                <Tab eventKey="File" title="File">
                                    <Form.Group>
                                        <Form.Label>
                                            Upload your file here
                                        </Form.Label>
                                        <Form.Control onChange={handleAttachmentFile} type="file" id="file" className=".attachment-files" />
                                    </Form.Group>
                                </Tab>
                                <Tab eventKey="URL" title="URL">
                                    <Form.Group>
                                        <Form.Label>
                                            Enter your URL here
                                        </Form.Label>
                                        <Form.Control onChange={handleAttachmentURL} type="text" id="url" className=".attachment-urls" />
                                    </Form.Group>
                                </Tab>
                            </Tabs>

                        </Form>

                    </div>
                    <Button variant="outline-secondary" size="sm">
                        Edit
                    </Button>
                    <Button variant="danger" size="sm">
                        Delete
                    </Button>
                </div>

            </div>
        </Container>
    )
}

export default NewSyllbusAttachment;