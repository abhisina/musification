import React from 'react';
import Button from 'react-bootstrap/Button';

export const DisplayFinalVideo = (props) => {
  const downloadFile = (event) => {
    event.preventDefault();
    const link = document.createElement('a');
    link.href = props.videoURL;
    link.download = "processed.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
    return (
        <>
          <div><video controls src={props.videoURL} /></div>
          <div><Button variant="success" type="submit" onClick={downloadFile}>Download</Button></div>
        </>
    )
}
