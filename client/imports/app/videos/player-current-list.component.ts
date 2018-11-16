import { Component, Input, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';


import 'rxjs/add/operator/combineLatest';

// import { VideosMetas } from '../../../../both/collections/video-meta.collection';
// import { VideoMeta } from '../../../../both/models/video-meta.model';
import { PlayLists } from '../../../../both/collections/playlists.collection';
import { Videos } from '../../../../both/collections/videos.collection';
import { VideosMetas } from '../../../../both/collections/video-meta.collection';
import { PlayListsUsers } from '../../../../both/collections/playlists-users.collection';

import { PlayList } from '../../../../both/models/playlist.model';
import { PlayListUser } from '../../../../both/models/playlist-user.model';
import { VideoMeta } from '../../../../both/models/video-meta.model';
import { Video } from '../../../../both/models/video.model';
import { VideoPlayList } from '../../../../both/models/video-playlist.model';

import { User } from '../../../../both/models/user.model';

import { PlayListsDialog } from './playlists-dialog.component';


@Component({
  selector: 'player-current-list',
  templateUrl: './player-current-list.component.html',
  styles: [ './player.component.scss' ]
})
@InjectUser('user')
export class PlayerCurrentListComponent implements OnInit, OnDestroy {
  @Input() videoPlayList: VideoPlayList;
  @Input() playList: PlayList;
  classe: string;
  video: VideoMeta;
  idElement: string;

  ngOnInit() {
    this.videoPlayListToVideoMeta()
    this.setClassElementVideoReading()
    this.setIdVideoPlaylist()
  }

  /**
   * setClassElementVideoReading - called by the html to set the style on the list element
   * if corresponding video is played or not.
   *
   * @param  {type} video: VideoMeta description
   * @return {type}                  description
   */
  setClassElementVideoReading(){
    var styleOn;
    var playListUser:PlayListUser = PlayListsUsers.findOne({user: Meteor.user()._id});
    if(playListUser && this.video && this.video._id === playListUser.currentVideo){
      if(styleOn) {
        this.classe = "videoPlaying mat-list-item";
      } else {
        this.classe = "mat-list-item";
      }
    }
  }

  videoPlayListToVideoMeta(){
    if(this.videoPlayList && this.videoPlayList.id_videoMeta){
      this.video = VideosMetas.findOne({_id: this.videoPlayList.id_videoMeta});
    }
  }

  /**
   * setIdVideoPlaylist - Called to compute the video element id among the list of videos of the current playlist.
   *
   * @param  {type} video: VideoMeta description
   * @return {type}                  description
   */
  setIdVideoPlaylist(){
    if(this.video){
      this.idElement = "playlist" + this.video._id;
    }
  }

  /**
   * readVideoButton - Listener of the play button (one play button per video list element).
   *
   * @param  {type} video: VideoMeta description
   * @return {type}                  description
   */
  readVideoButton(){
    if(this.video){
      Meteor.call('setVideoPlayListUser', this.video._id);
    }
  }

  /**
   *   Listener of the remove video from playlist button. We need to remove the video from the PlayList element
   * and from the PlayListUser element.
   */
  removeVideoPlaylist():void {
    PlayLists.update({_id: this.playList._id}, {$pull: {list: this.videoPlayList}});

    let videoContainer = document.getElementById("videoContainer");
    let videoTag = document.getElementById("singleVideo");
    if(videoTag){
      const found = Videos.findOne(this.video.video);
      if(!found){
        return;
      }
      if(found.url === videoTag.getAttribute('src')){
        videoContainer.innerHTML = "";
        Meteor.call('blankCurrentVideo');
      }
    }
  }
}
