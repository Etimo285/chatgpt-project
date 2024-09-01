import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'

function AudioRecorder({ onTranscription, selectedLang }) {
    const [recorder, setRecorder] = useState(null);
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false)

    const recording = async () => {

        let audioChunks = [];
    
        try {
            const stream_ = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(stream_);
            const mediaRecorder = new MediaRecorder(stream_, { mimeType: 'audio/webm' });

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            console.log(MediaRecorder.isTypeSupported('audio/webm'));
            console.log(MediaRecorder.isTypeSupported('audio/wav'))

            mediaRecorder.onstop = async () => {
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'audio.webm');
                    formData.append('lang', JSON.stringify(selectedLang))
                    console.log(formData);

                    try {
                        const response = await fetch('http://localhost:4080/transcribe', {
                            method: 'POST',
                            body: formData,
                        });

                        const data = await response.json();
                        onTranscription(data.text);
                    } catch (error) {
                        console.error('Error transcribing audio:', error);
                    }
                }

            };

            setRecorder(mediaRecorder);
            mediaRecorder.start();
        } catch (error) {
            console.log(error);
        }
    };

    const stopRecording = () => {
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleRecord = () => {
        if(!isRecording){
            recording()
        }else if(isRecording){
            stopRecording()
        }
        setIsRecording(!isRecording)
    }

    return (
        <div className={`align-center record_button_container ${isRecording? "isRecording" : ""}`} onClick={toggleRecord}>
            <FontAwesomeIcon className="record_button" icon={faMicrophone} />
        </div>
    );
}

export default AudioRecorder;
