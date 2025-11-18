export interface AuthorDto {
  _id: string;
  name: string;
  lastName: string;
  userName: string;
  profileImageUrl?: string;
}

export interface Publication {
  _id: string;
  title: string;
  description: string;
  image?: string;
  author: AuthorDto;
  numberLikes: number;
  userLiked: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicationsResponse {
  success: boolean;
  message: string;
  data: {
    publications: Publication[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

export interface CreatePublicationRequest {
  title: string;
  description: string;
  image?: File;
}