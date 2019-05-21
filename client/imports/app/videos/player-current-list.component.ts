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

import { DisplayVideoPlayListPipe } from '../shared/display-video-playlist.pipe';

@Component({
  selector: 'player-current-list',
  templateUrl: './player-current-list.component.html',
  styles: [ './player.component.scss' ],
  providers: [DisplayVideoPlayListPipe]
})
@InjectUser('user')
export class PlayerCurrentListComponent implements OnInit, OnDestroy {
  playList: PlayList
  classe: string
  videosPlayList: VideoPlayList[]
  idElement: string
  currentVideoUser: VideoUser
  currentPlayListUser: PlayListUser

  videosUsersSub: Subscription
  playListsSub: Subscription
  currentPlayListSubs: Subscription

  onSwitchTrack: boolean

  currentId: string

  constructor (private displayVideoPlayListPipe:DisplayVideoPlayListPipe){}

  ngOnInit() {
    this.onSwitchTrack = false

    this.playListsSub = MeteorObservable.subscribe('playLists', {}).subscribe();

    this.videosUsersSub = MeteorObservable.subscribe('videosUsers', {}).subscribe();

    this.currentPlayListSubs = MeteorObservable.subscribe('playlistsUsers').subscribe(() => {
      if(Meteor.user() === undefined){
        return;
      }
      PlayListsUsers.find({user: Meteor.user()._id, active: true}).subscribe(listPlayListUser => {
        if(listPlayListUser === undefined || listPlayListUser.length === 0){
          return false;
        }
        this.currentId = listPlayListUser[0].playlist

        PlayLists.find({_id: this.currentId}).subscribe(playlistsSearch => {
          let currentPlaylist: PlayList = playlistsSearch[0]
          if(currentPlaylist && currentPlaylist._id === this.currentId){
            this.playList = currentPlaylist
            this.currentPlayListUser = listPlayListUser[0]
            this.videoPlayListToVideoMeta()
            this.initVideoUser()
          }
        })

      });
    });



    Meteor.setInterval(() => {
      var videoTag = document.getElementById("singleVideo")
      if(videoTag != undefined && this.currentVideoUser != undefined){
        if(videoTag.ended){
          this.switchToNextVideo()
        }else{
          VideosUsers.update({_id: this.currentVideoUser._id}, {$set : {currentTime: videoTag.currentTime}})
        }
      }
    }, 1000)
  }

  ngOnDestroy() {
      this.videosUsersSub.unsubscribe()
      this.playListsSub.unsubscribe()
      this.currentPlayListSubs.unsubscribe()
  }

  private switchToNextVideo(): void {
    if(this.onSwitchTrack){
      return
    }

    const playlist = PlayLists.findOne({_id: this.currentPlayListUser.playlist})
    if(this.currentPlayListUser.currentPosition < playlist.list.length-1){
      VideosUsers.update({_id: this.currentVideoUser._id},{$set : {currentTime: 0.000000}}).subscribe(() => {
        this.onSwitchTrack = true
        PlayListsUsers.update({_id: this.currentPlayListUser._id}, {$set: {currentPosition: this.currentPlayListUser.currentPosition+1}})
      })
    }
  }

  initVideoUser(){
    if(!this.currentPlayListUser){
      return
    }

    this.currentVideoUser = VideosUsers.findOne({playListUserId: this.currentPlayListUser._id})
    this.readVideo()
  }

  videoPlayListToVideoMeta(){
    if(!this.playList){
      return
    }

    this.videosPlayList = this.playList.list
    this.videosPlayList.sort((a:VideoPlayList, b:VideoPlayList)=>{
      return a.currentPosition < b.currentPosition ? -1 : 1
    })
  }

  /**
   * readVideoButton - Listener of the play button (one play button per video list element).
   *
   * @param  {type} video: VideoMeta description
   * @return {type}                  description
   */
  readVideoButton(newPosition: number): void{
      Meteor.call('setVideoPlayListUser', this.currentPlayListUser._id);

      PlayListsUsers.update({_id: this.currentPlayListUser._id}, {$set: {currentPosition: newPosition}}).subscribe((number) => {
        let videoTag: HTMLVideoElement = document.getElementById("singleVideo");
        if(videoTag){
          videoTag.currentTime = 0.000000
          videoTag.play()
        }
      })
  }

  /**
   *   Listener of the remove video from playlist button. We need to remove the video from the PlayList element
   * and from the PlayListUser element.
   */
  removeVideoPlaylist(videoPlaylist:VideoPlayList):void {
    PlayLists.update({_id: this.playList._id}, {$pull: {list: {date: videoPlaylist.date}}}).subscribe(() => {
      Meteor.call('afterDeleteVideoFromPlaylist', this.playList._id, videoPlaylist.currentPosition)

      let video:string = this.displayVideoPlayListPipe.transform(videoPlaylist, "video")

      let videoTag: HTMLVideoElement = document.getElementById("singleVideo");
      if(videoTag){
        const found = Videos.findOne(video);
        if(!found){
          return;
        }
        if(found.url === videoTag.getAttribute('src')){
          videoTag.setAttribute('src','')
          Meteor.call('blankCurrentVideo')
        }
      }
    })
  }

  /**
	 * Called when the PlayListsUsers data changes.
	 */
	readVideo(): void {
    let found = undefined

    if(this.currentPlayListUser && this.videosPlayList && this.videosPlayList[this.currentPlayListUser.currentPosition]){
      let video: VideoMeta = VideosMetas.findOne({_id: this.videosPlayList[this.currentPlayListUser.currentPosition].id_videoMeta})
  		if (!video) {
        return;
      }

      found = Videos.findOne(video.video);
    }



    if (found === undefined) {
      return; //TODO : log error message
    }

    let videoTag: HTMLVideoElement = document.getElementById("singleVideo")
    let newUrl = found.url + this.getUserParameterVideoSrc()
    if(newUrl != videoTag.getAttribute('src')){
      videoTag.setAttribute('src', newUrl)

      let timeToSet:number = 0.000000


      if(this.onSwitchTrack){
        this.onSwitchTrack = false
        videoTag.currentTime = timeToSet
        videoTag.play()
      }else{
        if(this.currentVideoUser){
          timeToSet = this.currentVideoUser.currentTime
        }
        videoTag.currentTime = timeToSet
        videoTag.pause()
      }
    }
  }

  getUserParameterVideoSrc(){
    return "?" + "userId=" + Meteor.userId() + "&" + "loginToken=" + Accounts._storedLoginToken()
  }
}
