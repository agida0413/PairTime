export enum PlanType {
  SOLO_ME = 'SOLO_ME',
  SOLO_OPPONENT = 'SOLO_OPPONENT',
  COUPLE = 'COUPLE'
}

export interface Plan {
  id: number;
  title: string;
  content: string;
  startAt: string;
  endAt: string;
  planType: PlanType;
  opponentNickname?: string; // SOLO_OPPONENT일 때 상대방 닉네임
  authorName: string;
  createdAt: string;
  planPosts: PlanPost[];
  planExps: PlanExp[];
  planReviews: PlanReview[];
}

export interface PlanPost {
  id: number;
  title: string;
  content: string;
  images: string[];
  likes: number;
  isLiked: boolean;
  authorName: string;
  createdAt: string;
}

export interface PlanReview {
  id: number;
  rating: number;
  reviewerName: string;
  createdAt: string;
}

export interface PlanExp {
  id: number;
  planExpDetails: PlanExpDetail[];
  authorName: string;
  createdAt: string;
}

export interface PlanExpDetail {
  id: number;
  title: string;
  expenditure: number;
  authorName: string;
  createdAt: string;
}
