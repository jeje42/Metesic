import { CollectionObject } from './collection-object.model';

export interface VideoUser extends CollectionObject {
  user: string;
  playList: string;
  currentVideo: string;
  currentTime: number;
}
