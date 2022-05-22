import React, { useState, useEffect, useContext } from 'react';
import { UploadVideo } from './video/UploadVideo';
import { ImageForm } from './video/ImageForm';
import { DisplayFinalVideo } from './video/DisplayFinalVideo';
import Spinner from 'react-bootstrap/Spinner';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { fetchFile, createFFmpeg } from '@ffmpeg/ffmpeg';
import { MusicDescription } from '../pb/service_pb';
import { MusicServiceContext } from '../App';

const ffmpeg = createFFmpeg({ log: false });

// https://stackoverflow.com/questions/35675529/using-ffmpeg-how-to-do-a-scene-change-detection-with-timecode/38205105#38205105
// https://www.bogotobogo.com/FFMpeg/ffmpeg_thumbnails_select_scene_iframe.php
// https://write.corbpie.com/automatically-overwrite-file-if-already-exists-with-ffmpeg/

export const Video = () => {
    const [progressPercent, setProgressPercent] = useState(0);
    const [manageState, setManageState] = useState(0);
    const [video, setVideo] = useState(null);
    const [statusText, SetStatusText] = useState('Loading...');
    const [timecodes, setTimecodes] = useState();
    const [duration, setDuration] = useState(null);
    const [videoURL, setVideoURL] = useState(null);
    var musicService = useContext(MusicServiceContext);

    const loadFfmpeg = async () => {
        if(!ffmpeg.isLoaded()) {
          await ffmpeg.load();
        }
        SetStatusText('');
        setManageState(1);
    }

    useEffect(() => {
        loadFfmpeg();        
      }, []);

    const processVideo = async (file) => {
        // set the progress directly to progress bar
        ffmpeg.setProgress(({ ratio }) => {
            setProgressPercent((ratio * 100.0).toFixed(2));
        });

        // make a generic logger
        const genericLogger = ({ type, message }) => {
            //console.log("type:" + type, "message:" + message);
        };

        const getVideoDetails = async (filename) => {
            const returnValue = {
                'duration': null,
                'resolution': null,
            };
            // set the logging hooks to parse the output
            ffmpeg.setLogger(({type, message}) => {
                // fill video length, video resolution
                let match = null;
                // Duration: 00:03:57.22, start: 0.000000, bitrate: 2450 kb/s
                if((match = message.match(/Duration: ([^ $]*):([^ $]*):([^ $]*\.[^ $]*), start: [^ $]*, bitrate: [^ $]* /)) !== null) {
                    returnValue.duration = {'hour': parseInt(match[1]), 'minute': parseInt(match[2]), 'second': parseFloat(match[3])};
                }
                // Stream #0:0(und): Video: h264 (High) (avc1 / 0x31637661), yuv420p, 1280x720 [SAR 1:1 DAR 16:9], 2256 kb/s, 23.98 fps, 23.98 tbr, 24k tbn, 47.95 tbc (default)
                else if((match = message.match(/Stream #[^ $]*: Video: [^ $]*.*, ([0-9]+)x([0-9]+).*/)) !== null) {
                    returnValue.resolution = {'width': match[1], 'height': match[2]};
                    // reset the logger
                    ffmpeg.setLogger(genericLogger);
                }

                // call the generic logger
                genericLogger(type, message);
            });

            await ffmpeg.run('-loglevel', 'info', '-hide_banner', '-i', filename);
            // return video details
            return returnValue;
        };

        const saveScreenShotAt0 = async (filename, width, height) => {
            // just save the first screen of the video
            const imageWidth = Math.min(500, width*3/2);
            const imageHeight = imageWidth * height / width;
            // we do not need output in this case unless there was an error, TODO handle error
            await ffmpeg.run('-loglevel', 'info', '-hide_banner', '-i', filename, '-ss', '0', '-f', 'image2', '-vframes', '1', '-s', `${Math.round(imageWidth)}x${Math.round(imageHeight)}`, '-y', filename + '000.png');
        };

        const getSaveOtherScreens = async (filename) => {
            const timeCodes = [parseFloat('0.0')]; // putting 0.0, as ffmpeg will not show start of a video as start of scene and it will fit nicely with our single frame setup later
            // the output in this case is useful to know the number of scenes to prepare for next phase
            // the corresponding timecodes
            ffmpeg.setLogger(({type, message}) => {
                let match = null;
                if((match = message.match(/showinfo.*] n:.* pts:.* pts_time:(.*) pos:.* stdev:.*/)) !== null) {
                    timeCodes.push(parseFloat(match[1]));
                }
                // call the generic logger
                genericLogger(type, message);
            });
            // if the loglevel is error, showinfo will not display anything, hence, it must be info
            await ffmpeg.run('-loglevel', 'info', '-hide_banner', '-i', filename, '-filter:v', 'select=\'gt(scene,0.4)\',showinfo,scale=w=\'min(500, iw*3/2):h=-1\'', '-vsync', 'vfr', '-y', filename + '%03d.png');
            // reset the logger
            ffmpeg.setLogger(genericLogger);
            // length of the array will denote the number of scenes
            return { 'timeCodes': timeCodes };
        };

        setVideo(file);
        ffmpeg.setProgress(({ ratio }) => {
            setProgressPercent((ratio * 100.0).toFixed(2));
        });
        SetStatusText('Assessing the file');
        setProgressPercent(0);
        setManageState(2);
        // write the video file to memfs for processing by ffmpeg
        ffmpeg.FS('writeFile', file.name, await fetchFile(file));

        // TODO: If at all the video is unparsable, handle error here and bail
        const videoInfo = await getVideoDetails(file.name);

        SetStatusText('Getting scenes from video');
        setProgressPercent(0);
        await saveScreenShotAt0(file.name, videoInfo.resolution.width, videoInfo.resolution.height);

        setProgressPercent(0);
        const { timeCodes } = await getSaveOtherScreens(file.name);

        SetStatusText('Detected ' + timeCodes.length + ' scene(s). Video duration H(' + parseInt(videoInfo.duration.hour) +
                    ') M(' + parseInt(videoInfo.duration.minute) + ') S(' + parseFloat(videoInfo.duration.second) + ')');
        
        const timeCodesWithImageURL = timeCodes.map((item, index)=>{
            const imagefile = file.name + index.toString().padStart(3,"0") + ".png";
            // console.log('filename:', file.name, ' imagefilename:', imagefile);
            const data = ffmpeg.FS('readFile', imagefile);
            const url = URL.createObjectURL(new Blob([data.buffer], {type: 'image/png'} ));
            return {'timecode': item, 'imageurl': url};
        });
        setTimecodes(timeCodesWithImageURL);
        setDuration(videoInfo.duration);
        

        // time to move to the next state/phase 3 i.e. show the generated screen shots with time code and ask for scene mood with default as happy
        setManageState(3);

        // delete the video - actually keep the video until later when the received audio can be mixed and given back to user
        // ffmpeg.ffmpeg.FS('unlink', file.name);
        // delete the generated images after display
        // Seggregate: Video time length
        // Seggregate: Number of scenes and their corresponding time periods and their MOOD
        // Seggregate: Volume Crescendo and Decescendo time
    }

    const OnUpload = (file) => {
        processVideo(file);
    }

    const progressToFinalStages = async() => {
        setProgressPercent(0);
        ffmpeg.setProgress(({ ratio }) => {
            setProgressPercent((ratio * 100.0).toFixed(2));
        });
        setManageState(5);
        // merge the saved file back with the video
        await ffmpeg.run('-loglevel', 'info', '-hide_banner', '-f', 's16le', '-ar', '44.1k', '-ac', '1', '-i', 'data.pcm', '-i', video.name, '-map', '0:a:0', '-map', '1:v:0', '-c:v', 'h264', '-c:a', 'aac', '-y', 'output.mp4');
        // delete the original video file
        await ffmpeg.FS('unlink', video.name);
        // delete the downloaded audio file
        await ffmpeg.FS('unlink', 'data.pcm');

        const data = ffmpeg.FS('readFile', 'output.mp4');
        const url = URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'} ));
        setVideoURL(url);
        setManageState(6); // new component to display video and download option
    }

    const processSubmitRequest = async (len, valArray) => {
        setManageState(4);
        // Delete the generated images
        for(let i = 0 ; i < len ; ++i) {
            const imagepath = video.name + i.toString().padStart(3, "0") + ".png";
            ffmpeg.FS('unlink', imagepath);
        }

        var google_protobuf_duration_pb = require('google-protobuf/google/protobuf/duration_pb.js');
        var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');

        var musicDescription = new MusicDescription();
        var vidLength = new google_protobuf_duration_pb.Duration();
        const seconds = Math.trunc(parseFloat(duration.second));
        const nanoseconds = 10000000 * (parseFloat(duration.second) - parseInt(seconds))
        vidLength.setSeconds(parseInt(duration.hour * 3600 + duration.minute * 60 + parseInt(seconds)));
        vidLength.setNanos(parseInt(nanoseconds));
        musicDescription.setDuration(vidLength);
        musicDescription.setVideofilename(video.name);
        musicDescription.setSendingsourceaudiofile(false);
        for(let i = 0 ; i < len ; ++i) {
            var timeStamp = new google_protobuf_timestamp_pb.Timestamp();
            var sceneDescription = new MusicDescription.SceneDescription();
            const seconds = Math.trunc(parseFloat(timecodes[i].timecode));
            const nanoseconds = 10000000 * (parseFloat(timecodes[i].timecode) - parseInt(seconds));
            const mood = valArray[i].value;
            timeStamp.setSeconds(parseInt(seconds));
            timeStamp.setNanos(parseInt(nanoseconds));
            sceneDescription.setMood(mood);
            sceneDescription.setStarttime(timeStamp);
            musicDescription.addScenes(sceneDescription, i);
        }
        // Make the gRPC call and wait for response
        // additionally start a timer to track timeout?
        var stream = musicService.getGeneratedMusic(musicDescription);
        var pcmData = ffmpeg.FS('open', 'data.pcm', 'w');
        stream.on('data', (response) => {
            // save the file from the response
            var u8Array = response.getContent();
            if(u8Array.length > 0) {
                ffmpeg.FS('write', pcmData, u8Array, 0, u8Array.length);
            }
        }).on('end', () => {
            ffmpeg.FS('close', pcmData);
            progressToFinalStages();
        }).on('error', () => {
            ffmpeg.FS('close', pcmData);
            ffmpeg.FS('unlink', 'data.pcm');
        });
        // wait to back end to process the music
        // Get the music, mix with video
        // display video frame and a download button
    }

    const OnMusicRequestSubmit = (len, valArray) => {
        processSubmitRequest(len, valArray);
    }

    return (
        <div className={Col}>
            { manageState <= 3 && <div className={Row}><p>{statusText}</p></div> }
            { manageState === 0 && <div className={Row}><Spinner animation="border" variant="primary" role="status" /></div> }
            { manageState === 1 && <div className={Row}><UploadVideo selectVideo={OnUpload}/></div> }
            { manageState === 2 && <div className={Row}><ProgressBar now={progressPercent} label={`${progressPercent} %`} /></div> }
            { manageState === 3 && <div className={Row}><ImageForm timecodes={timecodes} selectScenes={OnMusicRequestSubmit} /></div> }
            { manageState === 4 && <div className={Row}><Spinner animation="border" variant="primary" role="status" /></div> }
            { manageState === 5 && <div className={Row}><ProgressBar now={progressPercent} label={`${progressPercent} %`} /></div> }
            { manageState === 6 && <div className={Row}><DisplayFinalVideo videoURL={videoURL}/></div> }            
        </div>
    )
}
