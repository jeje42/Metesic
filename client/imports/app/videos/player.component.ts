import { Component, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
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
  selector: 'player',
  templateUrl: './player.component.html',
  styles: [ './player.component.scss' ]
})
@InjectUser('user')
export class PlayerComponent implements OnInit, OnDestroy {
  listVideosPlayList: VideoPlayList[];
  currentPlaylist: Observable<PlayList[]>;
  currentPlayListUser: Observable<PlayListUser[]>;

  currentPlaylistId: string;

  user: Meteor.User;
  videoReading: VideoMeta;
  displayPlayer: boolean;
  displayVideo: boolean;

  playListsSub: Subscription;
  videosSubs: Subscription;
  videosMetaSubs: Subscription;
  currentPlayListSubs: Subscription;

  constVideoMetaId: string;

  actionsAlignment: string;
  /**
   * Config for the playlists's modal.
   */
  config: MatDialogConfig = {
    disableClose: false,
    hasBackdrop: true,
    backdropClass: '',
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    },
    data: {
      message: 'Akadok'
    }
  };

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(private zone: NgZone,	private formBuilder: FormBuilder,public dialog: MatDialog, @Inject(DOCUMENT) doc: any) {
    // Possible useful example for the open and closeAll events.
    // Adding a class to the body if a dialog opens and
    // removing it after all open dialogs are closed
    dialog.afterOpen.subscribe((ref: MatDialogRef<any>) => {
      if (!doc.body.classList.contains('no-scroll')) {
        doc.body.classList.add('no-scroll');
      }
    });
    dialog.afterAllClosed.subscribe(() => {
      doc.body.classList.remove('no-scroll');
    });
  }

  ngOnInit() {
    this.displayPlayer = false;
    this.displayVideo = false;
    this.videoReading = undefined;
    this.constVideoMetaId = "playlist";

	  this.videosSubs = MeteorObservable.subscribe('videos').subscribe();

    this.videosMetaSubs = MeteorObservable.subscribe('videoMeta').subscribe();

    this.currentPlayListSubs = MeteorObservable.subscribe('playlistsUsers').subscribe(() => {
      if(this.user === undefined){
        return;
      }
      this.currentPlayListUser = PlayListsUsers.find({user: this.user._id});

      this.currentPlayListUser.subscribe(listPlayListUser => {
        this.initVideosPlayListId(listPlayListUser);

        var playListUser: PlayListUser = PlayListsUsers.findOne({user: this.user._id});
          if(playListUser === undefined){
            return;
          }
            this.readVideo(VideosMetas.findOne({_id: playListUser.currentVideo}));
      });
    });

	  this.playListsSub = MeteorObservable.subscribe('playLists', {}).subscribe();

    this.counter().subscribe(
      data => {
        var videoTag = document.getElementById("singleVideo");
        if(videoTag != undefined){
          Meteor.call('setCurrentTime', videoTag.currentTime);
        }
      }
    );
  }

	ngOnDestroy() {
		this.playListsSub.unsubscribe();
		this.videosSubs.unsubscribe();
    this.videosMetaSubs.unsubscribe();
	}

  counter() {
    return Observable.interval(10000).flatMap(() => {
      return "u";
    });
  }


  /**
   * initVideosPlayListId - called when the client receives the PlayListsUsers data.
   *
   * @param  {type} playListId: PlayListUser[] description
   * @return {type}                            description
   */
  initVideosPlayListId(playListId: PlayListUser[]){
    if(playListId === undefined || playListId.length === 0){
      return;
    }
    this.currentPlaylistId = playListId[0].currentPlaylist;
    this.currentPlaylist = PlayLists.find({_id: this.currentPlaylistId}).zone();

    this.currentPlaylist.subscribe(listPlayList => this.initVideosPlaylistObject(listPlayList));
  }



  /**
   * initVideosPlaylistObject - called when the client receives the PlayList data.
   *
   * @param  {type} playLists: PlayList[] description
   * @return {type}                       description
   */
  initVideosPlaylistObject(playLists: PlayList[]){
    if(playLists[0] === undefined || playLists[0]._id != this.currentPlaylistId){
      return;
    }
    this.listVideosPlayList = playLists[0].list;
  }

  videoPlayListToVideoMeta(videoPlayList: VideoPlayList){
    return VideosMetas.findOne({_id: videoPlayList.id_videoMeta});
  }

  /**
   * setIdVideoPlaylist - Called to compute the video element id among the list of videos of the current playlist.
   *
   * @param  {type} video: VideoMeta description
   * @return {type}                  description
   */
  setIdVideoPlaylist(video: VideoMeta){
    return this.constVideoMetaId + video._id;
  }


  /**
   * readVideoButton - Listener of the play button (one play button per video list element).
   *
   * @param  {type} video: VideoMeta description
   * @return {type}                  description
   */
  readVideoButton(video: VideoMeta){
    Meteor.call('setVideoPlayListUser', video._id);
  }


	/**
	 * Called when the PlayListsUsers data changes.
	 */
	readVideo(video: VideoMeta): void {
		if (!video) {
      return;
    }

    const found = Videos.findOne(video.video);

    if (found === undefined) {
      return; //TODO : log error message
    }

    this.displayPlayer = true;
    this.displayVideo = true;

    let videoContainer = document.getElementById("videoContainer");
    let videoTag = document.getElementById("singleVideo");
    if(!videoTag){
      videoTag = document.createElement("video");
      videoTag.setAttribute('width', "800");
      videoTag.setAttribute('height', "450");
      videoTag.setAttribute('controls', "true");
      videoTag.setAttribute('autoplay', "true");
      videoTag.setAttribute('id',"singleVideo");
      videoTag.setAttribute('type',"video/mp4");
      videoTag.setAttribute('src', found.url);
      var playListUser:PlayListUser = PlayListsUsers.findOne({user: this.user._id});
      if(playListUser && playListUser.currentTime){
        videoTag.currentTime = playListUser.currentTime;
      }
      videoContainer.appendChild(videoTag);
      videoTag.pause();
    }else{
      if(found.url != videoTag.getAttribute('src')){
        videoTag.setAttribute('src', found.url);
        var playListUser:PlayListUser = PlayListsUsers.findOne({user: this.user._id});
        if(playListUser){
          videoTag.currentTime = 0.000000;
        }
        videoTag.pause();
      }
    }
}


  /**
   * setClassElementVideoReading - called by the html to set the style on the list element
   * if corresponding video is played or not.
   *
   * @param  {type} video: VideoMeta description
   * @return {type}                  description
   */
  setClassElementVideoReading(video: VideoMeta){
    var styleOn;
    var playListUser:PlayListUser = PlayListsUsers.findOne({user: this.user._id});
    if(playListUser){
      styleOn = (video._id === playListUser.currentVideo);
    }
    if(styleOn) {
      return "videoPlaying mat-list-item";
    } else {
      return "mat-list-item";
    }
  }

  /**
   *   Listener of the remove video from playlist button. We need to remove the video from the PlayList element
   * and from the PlayListUser element.
   */
  removeVideoPlaylist(videoPlayList: VideoPlayList, playList: PlayList):void {
    PlayLists.update({_id: playList._id}, {$pull: {list: videoPlayList}});

    let videoContainer = document.getElementById("videoContainer");
    let videoTag = document.getElementById("singleVideo");
    if(videoTag){
      const found = Videos.findOne(this.videoPlayListToVideoMeta(videoPlayList).video);
      if(!found){
        return;
      }
      if(found.url === videoTag.getAttribute('src')){
        videoContainer.innerHTML = "";
        Meteor.call('blankCurrentVideo');
      }
    }
  }

  deleteCurrentPlayList(playlist: PlayList){
    let videoContainer = document.getElementById("videoContainer");
    if(videoContainer){
      videoContainer.innerHTML = "";
      Meteor.call('blankCurrentVideo');
    }
    Meteor.call('removePlayList', playlist._id);
  }


  /**
   * openEditPlayLists - Opens the playlist editor popup.
   *
   * @return {type}  description
   */
  openEditPlayLists() {
    let dialogRef = this.dialog.open(PlayListsDialog, this.config);
    dialogRef.componentInstance.actionsAlignment = this.actionsAlignment;
		dialogRef.componentInstance.user = Meteor.user();
		dialogRef.componentInstance.loggedUser = this.user;
	}
}
