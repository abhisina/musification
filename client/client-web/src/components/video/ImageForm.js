import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';

/*
    Create a form in this page with timecodes & images
    Each row should have a timecode, scene image and an option to select mood in scene
    on submit send the selection to backend
    then state should progress to next phase
*/
export const ImageForm = (props) => {
    const [clicked, setClicked] = useState(false);
    const handleSubmit = (event) => {
        event.preventDefault();
        setClicked(true);
        window.scrollTo(0,0);
        props.selectScenes(event.target.length - 2, event.target);
        // may be good place for deleting all the generated images but keep the video for now
        // ffmpeg -f s16le -ar 44.1k -ac 1 -i data.pcm -i ~/Desktop/Cycling\ -\ 39183.mp4 -map 0:a:0 -map 1:v:0 -c:v copy -y output.mkv        
        /*
        Information that we are sending to the backend
        Duration: Hr:Min:Sec:MiSec
        Length of array
        Array consisting of timecode and mood
        */
    }

    return (
        <Form onSubmit={!clicked ? handleSubmit : null}>
            { props.timecodes.map((item, index) => { return(
                <div key={index}>
                    <Form.Row>
                        <Form.Group as={Col}>
                            <Form.Row>
                                <Form.Label>Time in Video: {item.timecode}</Form.Label>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col}>
                                    <Form.Label>Select Mood in Scene:</Form.Label>
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Control as="select" defaultValue="Happy">
                                        <option>Breathy</option>
                                        <option>Bright</option>
                                        <option>Catchy</option>
                                        <option>Creepy</option>
                                        <option>Endless</option>
                                        <option>Energetic</option>
                                        <option>Grungy</option>
                                        <option>Memories</option>
                                        <option>Moving</option>
                                        <option>Rebellious</option>
                                        <option>Romantic</option>
                                        <option>Sad</option>
                                        <option>Happy</option>
                                    </Form.Control>
                                </Form.Group>
                            </Form.Row>
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Image src={item.imageurl} rounded />
                        </Form.Group>
                    </Form.Row>
                </div>
            )})}
            <Form.Row>
                <Form.Group as={Col}>
                    <Form.Check type="checkbox" label="Mix with current audio" disabled />
                </Form.Group>
                <Form.Group as={Col}>
                    <Button variant="primary" type="submit" disabled={clicked}>
                        Choose scene mood and click
                    </Button>
                </Form.Group>
            </Form.Row>
        </Form>
    )
}
