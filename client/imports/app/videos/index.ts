import { VideosListComponent } from './videos-list.component';
import { VideosFormComponent } from './videos-form.component';
// import { PartyDetailsComponent } from './party-details.component';
import { VideosUploadComponent } from "./videos-upload.component";
import { PlayerComponent } from "./player.component";
import { PlayListsDialog } from './playlists-dialog.component';
import { PlayListsAddChooseDialog } from './playlists-add-choose-dialog.component';

export const VIDEOS_DECLARATIONS = [
  VideosListComponent,
  VideosFormComponent,
  VideosUploadComponent,
  PlayerComponent
];

export const VIDEOS_DECLARATIONS_MODALS = [
	PlayListsDialog,
  PlayListsAddChooseDialog
];

// TODO : enlever le videoFormComponent
