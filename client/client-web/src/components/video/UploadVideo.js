import React from 'react';
import Form from 'react-bootstrap/Form';

export const UploadVideo = (props) => {
    return (
        <Form>
            <Form.File id="formcheck-api-regular">
                <Form.File.Label>Click here to locate your file</Form.File.Label>
                <Form.File.Input onChange={(e) => props.selectVideo(e.target.files?.item(0))} accept="video/*,image/gif" />
            </Form.File>
        </Form>
    )
}