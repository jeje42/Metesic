import {Component, EventEmitter, Output} from '@angular/core';

import template from './videos-upload.component.html';
import style from './videos-upload.component.scss';

import { uploadVideos } from '../../../../both/methods/videos.methods';
import {Subject, Subscription, Observable} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";

@Component({
  selector: 'videos-upload',
  template,
  styles: [ style ]
})
export class VideosUploadComponent {
  fileIsOver: boolean = false;
  uploading: boolean = false;
  @Output() onFile: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}

  fileOver(fileIsOver: boolean): void {
    this.fileIsOver = fileIsOver;
  }

  onFileDrop(file: File): void {
    this.uploading = true;

    uploadVideos(file)
      .then((result) => {
        this.uploading = false;
        this.addFile(result);
      })
      .catch((error) => {
        this.uploading = false;
        console.log(`Something went wrong!`, error);
      });
  }

  addFile(file) {
    this.onFile.emit(file._id);
  }
}
