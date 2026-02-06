
export interface FriendshipMessage {
  title: string;
  message: string;
  reasons: string[];
}

export enum AppState {
  ASKING = 'ASKING',
  CELEBRATING = 'CELEBRATING',
}
