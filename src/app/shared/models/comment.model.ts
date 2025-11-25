export interface CommentAuthor {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  profileImageUrl?: string;
}

export interface Comment {
  _id: string;
  publication: string;
  author: CommentAuthor;
  message: string;
  edited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: {
    comments: Comment[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

export interface CreateCommentRequest {
  message: string;
}