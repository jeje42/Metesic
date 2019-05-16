import {Pipe, PipeTransform} from '@angular/core';
import { Videos } from '../../../../both/collections/videos.collection';
import { VideosMetas } from '../../../../both/collections/video-meta.collection';
import { VideoMeta } from '../../../../both/models/video-meta.model';
import { VideoPlayList } from '../../../../both/models/video-playlist.model';

@Pipe({
  name: 'displayVideoPlayList'
})
export class DisplayVideoPlayListPipe implements PipeTransform {
  transform(videoPlaylist: VideoPlayList, valueExpected: string) : string{
    if (!videoPlaylist) {
      return ""
    }

    let video:VideoMeta = VideosMetas.findOne({_id:  videoPlaylist.id_videoMeta})

    if(!video){
      return ""
    }

    if("correct" == valueExpected){
      return video && video.name ? video.name:""
    }

    if("name" == valueExpected){
      return video.name
    }else if("description" == valueExpected){
      return video.description
    }else if("video" == valueExpected){
      return video.video
    }else{
      return video.name
    }
  }
}
