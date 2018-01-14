import { VideosListComponent } from './videos-list.component';
// import { PartyDetailsComponent } from './party-details.component';
import { PlayerComponent } from "./player.component";
import { PlayListsDialog } from './playlists-dialog.component';
import { PlayListsAddChooseDialog } from './playlists-add-choose-dialog.component';

export const VIDEOS_DECLARATIONS = [
  VideosListComponent,
  PlayerComponent
];

export const VIDEOS_DECLARATIONS_MODALS = [
	PlayListsDialog,
  PlayListsAddChooseDialog
];

// TODO : enlever le videoFormComponent
