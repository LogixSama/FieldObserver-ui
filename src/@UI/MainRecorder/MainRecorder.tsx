import React, { FC, memo, useEffect, useRef, useState } from "react";
import {
  Box,
  Icon,
  Theme,
  Button,
  useTheme,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react";
import {
  FaVideoSlash,
  FaDownload,
  FaCamera,
  FaUpload,
  FaArrowCircleUp,
} from "react-icons/fa";
import "video-react/dist/video-react.css";
import { ReactMediaRecorder } from "react-media-recorder";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  Stack,
  Checkbox,
  Link
} from "@chakra-ui/react";

import { Input } from "@chakra-ui/react";

// @ts-ignore
import { Player } from "video-react";
// @ts-ignore
import RecordRTC, {
  GifRecorder,
  invokeSaveAsDialog,
  MediaStreamRecorder,
  // @ts-ignore
  RecordRTCPromisesHandler,
  WebAssemblyRecorder,
} from "recordrtc";
import FileSaver, { saveAs } from "file-saver";

const VARIANT_COLOR = 'teal'


const MainRecorder: FC = () => {
  const theme: Theme = useTheme();
  const [recorder, setRecorder] = useState<RecordRTC | null>();
  const [stream, setStream] = useState<MediaStream | null>();
  const [videoBlob, setVideoUrlBlob] = useState<Blob | null>();
  const [type, setType] = useState<"video" | "screen">("video");
  const [recordingStatus, setRecordingStatus] = useState<boolean>(false);
  const [isFileUploaded, setFileUploaded] = useState<boolean>(false);
  const [textUpload, setTextUpload] = useState<string>("Upload....");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video!.srcObject = stream;
        video!.play();
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  const startRecording = async () => {
    setRecordingStatus(false);
    getVideo();
    const mediaDevices = navigator.mediaDevices;
    const stream: MediaStream =
      type === "video"
        ? await mediaDevices.getUserMedia({
            video: true,
            audio: true,
          })
        : await (mediaDevices as any).getDisplayMedia({
            video: true,
            audio: false,
          });
    const recorder: RecordRTC = new RecordRTCPromisesHandler(stream, {
      type: "video",
      mimeType: "video/mp4",
    });

    await recorder.startRecording();
    setRecorder(recorder);
    setStream(stream);
    setVideoUrlBlob(null);
  };

  const getData = (e: any) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    console.log(file);
    setTextUpload(file.name);
  };

  const uploadData = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "React POST Request Example" }),
    };
    const response = await fetch("https://reqres.in/api/posts", requestOptions);
    setFileUploaded(true);

    const data = await response.json();
  };
  const stopRecording = async () => {
    if (recorder) {
      await recorder.stopRecording();
      const blob: Blob = await recorder.getBlob();
      (stream as any).stop();
      setVideoUrlBlob(blob);
      setStream(null);
      setRecorder(null);
      setRecordingStatus(true);
    }
  };

  const downloadVideo = () => {
    if (videoBlob) {
      invokeSaveAsDialog(videoBlob, "video.mp4");
    }
  };

  const changeType = () => {
    if (type === "screen") {
      setType("video");
      getVideo();
    } else {
      setType("screen");
    }
  };

  return (
    <>
      <Tabs>
        <TabList>
          <Tab>Media Upload</Tab>
          <Tab>Kenesis Config</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {isFileUploaded ? (
              <Alert status="success" variant="subtle">
                <AlertIcon />
                Data uploaded to the server. Fire on!
              </Alert>
            ) : null}
            <SimpleGrid spacing="5" p="5">
              <Box
                display="flex"
                justifyContent="center"
                flexDirection={[
                  "column", // 0-30em
                  "row", // 30em-48em
                  "row", // 48em-62em
                  "row", // 62em+
                ]}
              >
                <Button
                  m="1"
                  bg={theme.colors.blue[600]}
                  size="lg"
                  aria-label="start recording"
                  color="white"
                  onClick={changeType}
                >
                  {type === "screen" ? "Record Screen" : "Record Video"}
                </Button>
                <IconButton
                  m="1"
                  bg={theme.colors.blue[600]}
                  size="lg"
                  aria-label="start recording"
                  color="white"
                  onClick={startRecording}
                  icon={<Icon as={FaCamera} />}
                />
                <IconButton
                  m="1"
                  bg={theme.colors.blue[600]}
                  size="lg"
                  color="white"
                  aria-label="stop recording"
                  onClick={stopRecording}
                  disabled={recorder ? false : true}
                  icon={<Icon as={FaVideoSlash} />}
                />
                <IconButton
                  bg={theme.colors.blue[600]}
                  m="1"
                  size="lg"
                  disabled={!!!videoBlob}
                  color="white"
                  onClick={downloadVideo}
                  aria-label="download video"
                  icon={<Icon as={FaUpload} />}
                />
                <label htmlFor="file-upload" className="custom-file-upload">
                  {textUpload}
                </label>
                <Input
                  type="file"
                  variant="unstyled"
                  width="auto"
                  id="file-upload"
                  style={{ margin: "15px 5px 0 10px" }}
                  onChange={getData}
                />
                <IconButton
                  m="1"
                  bg={theme.colors.blue[600]}
                  size="lg"
                  aria-label="start recording"
                  color="white"
                  icon={<Icon as={FaArrowCircleUp} />}
                />
              </Box>

              {!recordingStatus && type === "video" ? (
                <div
                  className="cam-feed"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <video
                    style={{ height: "600px", width: "800px" }}
                    ref={videoRef}
                  />
                </div>
              ) : (
                <Box display="flex" justifyContent="center">
                  <Box
                    bg={!!videoBlob ? "inherit" : "blue.50"}
                    h="50vh"
                    width={[
                      "100%", // 0-30em
                      "100%", // 30em-48em
                      "50vw", // 48em-62em
                      "50vw", // 62em+
                    ]}
                  >
                    {!!videoBlob && (
                      <Player src={window.URL.createObjectURL(videoBlob)} />
                    )}
                  </Box>
                </Box>
              )}
            </SimpleGrid>{" "}
          </TabPanel>
          <TabPanel>
            <div className="form" style={ {display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Box my={8} textAlign="left" size="lg">
              <form>
                <FormControl>
                  <FormLabel>Email address</FormLabel>
                  <Input type="email" placeholder="Enter your email address" />
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" placeholder="Enter your password" />
                </FormControl>

                <Button variantColor={VARIANT_COLOR} width="full" mt={4}>
                  Sign In
                </Button>
              </form>
            </Box>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default memo(MainRecorder);
