import { DisplayNamePipe } from './display-name.pipe';
import {RsvpPipe} from "./rsvp.pipe";
import {DisplayMainImagePipe} from "./display-main-image.pipe";
import {DisplayVideoPipe} from "./display-video.pipe";
import {DisplayVideoPlayListPipe} from "./display-video-playlist.pipe";

export const SHARED_DECLARATIONS: any[] = [
  DisplayNamePipe,
  RsvpPipe,
  DisplayMainImagePipe,
  DisplayVideoPipe,
  DisplayVideoPlayListPipe
];
