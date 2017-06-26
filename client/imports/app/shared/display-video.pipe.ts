import {Pipe, PipeTransform} from '@angular/core';
import { Videos } from '../../../../both/collections/videos.collection';
import { Video } from '../../../../both/models/video.model';

@Pipe({
  name: 'displayVideo'
})
export class DisplayVideoPipe implements PipeTransform {
  transform(video: Video) {
    if (!video) {
      return;
    }

    let videoUrl: string;

    const found = Videos.findOne(video);

	var videos = Videos.find();
	videos.fetch().forEach(video => console.log(video));

    if (found) {
      videoUrl = found.url;
    }

    return videoUrl;
  }
}
