import { Component, Input, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';
import { interval } from 'rxjs';



import 'rxjs/add/operator/combineLatest';

// import { VideosMetas } from '../../../../both/collections/video-meta.collection';
// import { VideoMeta } from '../../../../both/models/video-meta.model';
import { PlayLists } from '../../../../both/collections/playlists.collection';
import { Videos } from '../../../../both/collections/videos.collection';
import { VideosMetas } from '../../../../both/collections/video-meta.collection';
import { PlayListsUsers } from '../../../../both/collections/playlists-users.collection';
import { VideosUsers } from '../../../../both/collections/videos-users.collection';


import { PlayList } from '../../../../both/models/playlist.model';
import { PlayListUser } from '../../../../both/models/playlist-user.model';
import { VideoUser } from '../../../../both/models/video-user.model';
import { VideoMeta } from '../../../../both/models/video-meta.model';
import { VideoPlayList } from '../../../../both/models/video-playlist.model';

@Component({
  selector: 'player-current-list',
  templateUrl: './player-current-list.component.html',
  styles: [ './player.component.scss' ]
})
@InjectUser('user')
export class PlayerCurrentListComponent implements OnInit, OnDestroy {
  playList: PlayList
  classe: string
  videos: Observable<VideoMeta[]>
  idElement: string
  currentVideoUser: string
  currentVideoUserId: string
  playListUser: PlayListUser

  videosUsersSub: Subscription
  playListsSub: Subscription
  currentPlayListSubs: Subscription

  ngOnInit() {
    this.playListsSub = MeteorObservable.subscribe('playLists', {}).subscribe();

    this.videosUsersSub = MeteorObservable.subscribe('videosUsers', {}).subscribe();

    this.currentPlayListSubs = MeteorObservable.subscribe('playlistsUsers').subscribe(() => {
      if(Meteor.user() === undefined){
        return;
      }
      let currentPlayListUser = PlayListsUsers.find({user: Meteor.user()._id});

      currentPlayListUser.subscribe(listPlayListUser => {
        if(listPlayListUser === undefined || listPlayListUser.length === 0){
          return false;
        }


        let currentPlaylist = PlayLists.find({_id: listPlayListUser[0].currentPlaylist})
        currentPlaylist.subscribe(list => {
          if(list.length >0){
            this.playList = list[0]
            this.videoPlayListToVideoMeta()
            this.initVideoUser()
          }
        });
      });
    });




    var counter = interval(1000)
    counter.subscribe(() => {
        var videoTag = document.getElementById("singleVideo")
        if(videoTag != undefined){
          VideosUsers.update({_id: this.currentVideoUserId}, {$set : {currentTime: videoTag.currentTime}});
        }
      }
    )
  }

  ngOnDestroy() {
      this.videosUsersSub.unsubscribe()
      this.playListsSub.unsubscribe()
      this.currentPlayListSubs.unsubscribe()
  };

  initVideoUser(){
    if(!this.playList){
      return
    }
    let currentVideoUser:Observable<VideoUser[]> = VideosUsers.find({user: Meteor.user()._id, playList: this.playList._id});

    currentVideoUser.subscribe(listVideoUser => {
        // var videoUser: VideoUser = VideosUsers.findOne({user: Meteor.user()._id, playList: this.playList._id});
        if(listVideoUser[0] === undefined){
          return;
        }
        this.currentVideoUserId = listVideoUser[0]._id
        this.currentVideoUser = listVideoUser[0].currentVideo
        this.readVideo(listVideoUser[0])
    });
  }

  videoPlayListToVideoMeta(){
    if(!this.playList){
      return
    }
    let list = [];
    for(let i =0 ; i<this.playList.list.length ; i++){
      let videoPlaylist:VideoPlayList = this.playList.list[i]
      list.push(videoPlaylist.id_videoMeta)
    }
    this.videos = VideosMetas.find({_id:  { $in: list}})
  }

  /**
   * readVideoButton - Listener of the play button (one play button per video list element).
   *
   * @param  {type} video: VideoMeta description
   * @return {type}                  description
   */
  readVideoButton(videoMetas){
      Meteor.call('setVideoPlayListUser', videoMetas._id, this.playList._id);

      let videoTag = document.getElementById("singleVideo");
      if(videoTag){
        videoTag.currentTime = 0.000000
        videoTag.play()
      }
  }

  /**
   *   Listener of the remove video from playlist button. We need to remove the video from the PlayList element
   * and from the PlayListUser element.
   */
  removeVideoPlaylist(videoMetas):void {
    PlayLists.update({_id: this.playList._id}, {$pull: {list: {id_videoMeta: videoMetas._id}}})

    let videoContainer = document.getElementById("videoContainer");
    let videoTag = document.getElementById("singleVideo");
    if(videoTag){
      const found = Videos.findOne(videoMetas.video);
      if(!found){
        return;
      }
      if(found.url === videoTag.getAttribute('src')){
        videoTag.setAttribute('src','')
        Meteor.call('blankCurrentVideo');
      }
    }
  }

  /**
	 * Called when the PlayListsUsers data changes.
	 */
	readVideo(videoUser: VideoUser): void {
    let video: VideoMeta = VideosMetas.findOne({_id: videoUser.currentVideo})
		if (!video) {
      return;
    }

    const found = Videos.findOne(video.video);

    if (found === undefined) {
      return; //TODO : log error message
    }

    let videoTag = document.getElementById("singleVideo")
    let newUrl = found.url + this.getUserParameterVideoSrc()
    if(newUrl != videoTag.getAttribute('src')){
      videoTag.setAttribute('src', newUrl)
      if(videoUser){
        videoTag.currentTime = videoUser.currentTime
      }else{
        videoTag.currentTime = 0.000000
      }
      videoTag.pause()
    }
  }

  getUserParameterVideoSrc(){
    return "?" + "userId=" + Meteor.userId() + "&" + "loginToken=" + Accounts._storedLoginToken()
  }
}
