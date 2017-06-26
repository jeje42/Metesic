import { CollectionObject } from './collection-object.model';

export interface VideoMeta extends CollectionObject {
  name: string;
  folderId: string;
  description?: string;
  owner?: string;
  public: boolean;
  video?: string;
  categories?: string[];
}
