import { CollectionObject } from './collection-object.model';

export interface VideoUser extends CollectionObject {
  user: string;
  playListUserId: string;
  currentTime: number;
}
