import { Document } from 'mongoose';

export interface BusinessMedia extends Document {
  readonly businessUuid: string;
  readonly mediaItems: MediaItem[];
}

export interface MediaItem {
  readonly name: string;
  readonly type: string;
  readonly container: string;
}
