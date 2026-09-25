import React, { useCallback, useState, useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Webcam from "react-webcam";
import Resizer from "react-image-file-resizer";

const resizeFile = (file) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      300,
      300,
      "JPEG",
      100,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });



function ImageModal(props) {
    const [show, setShow] = useState(false);

    const handleClose = useCallback((file, image) => {
        setShow(false);
        props.setImage(image);
        props.setImageFile(file);
    }, [props]);

    const handleShow = useCallback(() => setShow(true), []);

    const webcamRef = React.useRef(null);

    const [isCapture, setIsCapture] = useState(false);

    function fileUpload(file) {
        handleClose(file, URL.createObjectURL(file));
    }

    const dataURLtoFile = React.useCallback((dataurl, filename) => {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }, []);

    const capture = React.useCallback(
        () => {
            const image = webcamRef.current.getScreenshot();
            const file = dataURLtoFile(image, "screenshot.jpeg");
            handleClose(file, image);
        },
        [webcamRef]
    );

    return (
        <div>
            <Button variant="primary" onClick={handleShow}>
                Upload image
            </Button>

            <Modal show={show} onHide={handleClose} animation={false} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Image Picker</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <Form.Check
                            type='radio'
                            label='Upload image from computer'
                            checked={!isCapture}
                            onChange={() => setIsCapture(!isCapture)}
                        />
                        {!isCapture &&
                            <div style={{paddingTop: '10px', paddingBottom: '10px'}}>
                                <input type="file" name="file" className='ml-2' onChange={(e) => fileUpload(e.target.files[0]) } />
                            </div>
                        }
                        <Form.Check
                            type='radio'
                            label='Capture from camera'
                            checked={isCapture}
                            onChange={() => setIsCapture(!isCapture)}
                        />
                        {isCapture &&
                            <div>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    width={1100}
                                />
                                <br/ >
                                <button className="btn btn-primary" onClick={capture}>Capture from camera</button>
                            </div>
                        }
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default React.memo(ImageModal);
