import apiClient from "./api-client";

export interface Comment {
  id: string;
  songId: string;
  customerId: string;
  text: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  customer?: {
    id: string;
    name: string;
    profilePicture?: string | null;
  };
  likesCount?: number;
  isLiked?: boolean;
  replies?: Comment[];
  song?: {
    id: string;
    title: string;
    artist: {
      id: string;
      name: string;
    };
  };
}

export interface CommentResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
}

// Moderation status enum removed

export interface CommentFilters {
  songId?: string;
  customerId?: string;
  search?: string;
  isDeleted?: boolean;
  // moderationStatus removed
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const CommentService = {
  // Get all comments with optional filters
  async getComments(filters: CommentFilters = {}): Promise<CommentResponse> {
    try {
      const response = await apiClient.get('/user/comments', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Get a single comment by ID
  async getCommentById(id: string): Promise<Comment> {
    try {
      const response = await apiClient.get(`/user/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comment with ID ${id}:`, error);
      throw error;
    }
  },

  // Reply to a comment
  async replyToComment(commentId: string, text: string): Promise<Comment> {
    try {
      const response = await apiClient.post(`/user/comments/${commentId}/reply`, { text });
      return response.data;
    } catch (error) {
      console.error(`Error replying to comment with ID ${commentId}:`, error);
      throw error;
    }
  },

  // Delete a comment (soft delete)
  async deleteComment(id: string): Promise<Comment> {
    try {
      const response = await apiClient.delete(`/user/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment with ID ${id}:`, error);
      throw error;
    }
  },

  // Restore a deleted comment
  async restoreComment(id: string): Promise<Comment> {
    try {
      const response = await apiClient.post(`/user/comments/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`Error restoring comment with ID ${id}:`, error);
      throw error;
    }
  },

  // Moderation methods removed

  // Get comment statistics
  async getCommentStats(): Promise<{
    totalComments: number;
    newCommentsToday: number;
    flaggedComments: number; // Kept for backward compatibility
    mostActiveSong: {
      id: string;
      title: string;
      commentCount: number;
    } | null;
  }> {
    try {
      const response = await apiClient.get('/user/comments/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching comment statistics:', error);
      throw error;
    }
  }
};
