export interface RaffleInfo {
  gameOpen: boolean;
  playerCount: number;
  prizePool: bigint;
  owner: string;
}

export interface PlayerEntry {
  address: string;
  entryCount: number;
}

export interface RaffleEvent {
  type: 'join' | 'adminAdd' | 'winner' | 'funded';
  player?: string;
  admin?: string;
  winner?: string;
  amount?: bigint;
  timestamp: number;
  transactionHash?: string;
}