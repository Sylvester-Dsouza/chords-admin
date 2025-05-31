import apiClient from './api-client';

// Define types based on the API DTOs
export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  courseType?: string; // Made optional for backward compatibility
  imageUrl?: string;
  totalDays: number;
  totalLessons: number;
  estimatedHours: number;
  isPublished: boolean;
  isFeatured: boolean;
  isActive: boolean;
  price?: number;
  viewCount: number;
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
  lessons?: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  dayNumber: number;
  duration: number;
  practiceSongTitle?: string;
  isPublished: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dayNumber: number;
  duration: number;
  practiceSongId?: string;
  practiceSongTitle?: string;
  instructions: string;
  videoUrl?: string;
  audioUrl?: string;
  isPublished: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    id: string;
    title: string;
    level: string;
  };
  practiceSong?: {
    id: string;
    title: string;
    artist: string;
    key?: string;
    tempo?: number;
  };
}

export interface Enrollment {
  id: string;
  customerId: string;
  courseId: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  currentDay: number;
  progress: number;
  enrolledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt?: Date;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
  course?: {
    id: string;
    title: string;
    subtitle?: string;
    level: string;
    totalDays: number;
    totalLessons: number;
    estimatedHours: number;
  };
}

export interface CreateCourseDto {
  title: string;
  subtitle?: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  courseType?: string;
  imageUrl?: string;
  totalDays?: number;
  totalLessons?: number;
  estimatedHours?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  price?: number;
}

export interface UpdateCourseDto {
  title?: string;
  subtitle?: string;
  description?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  courseType?: string;
  imageUrl?: string;
  totalDays?: number;
  totalLessons?: number;
  estimatedHours?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  price?: number;
}

export interface CreateLessonDto {
  courseId: string;
  title: string;
  description: string;
  dayNumber: number;
  duration: number;
  practiceSongId?: string;
  practiceSongTitle?: string;
  instructions: string;
  videoUrl?: string;
  audioUrl?: string;
  isPublished?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  dayNumber?: number;
  duration?: number;
  practiceSongId?: string;
  practiceSongTitle?: string;
  instructions?: string;
  videoUrl?: string;
  audioUrl?: string;
  isPublished?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

// Backward compatibility exports
export type VocalCourse = Course;
export type VocalLesson = Lesson;
export type VocalLessonSummary = LessonSummary;
export type CreateVocalCourseDto = CreateCourseDto;
export type UpdateVocalCourseDto = UpdateCourseDto;
export type CreateVocalLessonDto = CreateLessonDto;
export type UpdateVocalLessonDto = UpdateLessonDto;

// Courses service
const coursesService = {
  // Course Management
  getAllCourses: async (search?: string, level?: string, isPublished?: boolean, courseType?: string): Promise<Course[]> => {
    try {
      let url = '/courses';
      const params = new URLSearchParams();

      // Set a high limit to get all courses for admin panel
      params.append('limit', '1000');
      params.append('page', '1');

      if (search) params.append('search', search);
      if (level) params.append('level', level);
      if (isPublished !== undefined) params.append('isPublished', isPublished.toString());
      if (courseType) params.append('courseType', courseType);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      console.log('🔍 Fetching courses from URL:', url);
      console.log('🔍 Full API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`);

      const response = await apiClient.get<{courses: Course[], total: number, page: number, limit: number}>(url);

      console.log('📦 Raw API Response:', response);
      console.log('📦 Response Status:', response.status);
      console.log('📦 Response Headers:', response.headers);
      console.log('📦 Response Data:', response.data);
      console.log('📦 Response Data Type:', typeof response.data);
      console.log('📦 Is Response Data Array?', Array.isArray(response.data));
      console.log('📦 Response Data JSON:', JSON.stringify(response.data, null, 2));

      if (response.data && typeof response.data === 'object') {
        console.log('📦 Response Data Keys:', Object.keys(response.data));
        if ('courses' in response.data) {
          console.log('📦 Courses Array:', response.data.courses);
          console.log('📦 Courses Array Length:', response.data.courses?.length);
          console.log('📦 Is Courses Array?', Array.isArray(response.data.courses));
          console.log('📦 Courses Array JSON:', JSON.stringify(response.data.courses, null, 2));
        } else {
          console.log('❌ No "courses" property found in response data');
        }

        // Check if response.data itself is an array (non-paginated response)
        if (Array.isArray(response.data)) {
          console.log('📦 Response data is directly an array of courses');
          console.log('📦 Direct array length:', response.data.length);
        }
      }

      // Return just the courses array from the paginated response
      const courses = response.data.courses || response.data || [];
      console.log('✅ Returning courses:', courses);
      console.log('✅ Returning courses length:', courses.length);
      console.log('✅ Returning courses JSON:', JSON.stringify(courses, null, 2));
      return courses;
    } catch (error: any) {
      console.error('❌ Error fetching courses:', error);
      if (error.response) {
        console.error('❌ Error Response Status:', error.response.status);
        console.error('❌ Error Response Data:', error.response.data);
        console.error('❌ Error Response Headers:', error.response.headers);
      }
      throw error;
    }
  },

  getCourseById: async (id: string, includeLessons?: boolean): Promise<Course> => {
    try {
      let url = `/courses/${id}`;
      if (includeLessons) url += '?includeLessons=true';

      console.log(`Fetching course with ID ${id}`);
      const response = await apiClient.get<Course>(url);
      console.log('Course fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course with ID ${id}:`, error);
      throw error;
    }
  },

  createCourse: async (courseData: CreateCourseDto): Promise<Course> => {
    try {
      console.log('Creating new course with data:', courseData);
      const response = await apiClient.post<Course>('/courses', courseData);
      console.log('Course created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  updateCourse: async (id: string, courseData: UpdateCourseDto): Promise<Course> => {
    try {
      console.log(`Updating course with ID ${id} with data:`, courseData);
      const response = await apiClient.patch<Course>(`/courses/${id}`, courseData);
      console.log('Course updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating course with ID ${id}:`, error);
      throw error;
    }
  },

  deleteCourse: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting course with ID ${id}`);
      await apiClient.delete(`/courses/${id}`);
      console.log('Course deleted successfully');
    } catch (error) {
      console.error(`Error deleting course with ID ${id}:`, error);
      throw error;
    }
  },

  // Lesson Management
  getLessonsByCourse: async (courseId: string): Promise<Lesson[]> => {
    try {
      console.log(`Fetching lessons for course ${courseId}`);
      const response = await apiClient.get<Lesson[]>(`/courses/${courseId}/lessons`);
      console.log('Lessons fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lessons for course ${courseId}:`, error);
      throw error;
    }
  },

  getLessonById: async (id: string): Promise<Lesson> => {
    try {
      console.log(`Fetching lesson with ID ${id}`);
      const response = await apiClient.get<Lesson>(`/courses/lessons/${id}`);
      console.log('Lesson fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lesson with ID ${id}:`, error);
      throw error;
    }
  },

  createLesson: async (lessonData: CreateLessonDto): Promise<Lesson> => {
    try {
      console.log('Creating new lesson with data:', lessonData);
      const response = await apiClient.post<Lesson>('/courses/lessons', lessonData);
      console.log('Lesson created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  updateLesson: async (id: string, lessonData: UpdateLessonDto): Promise<Lesson> => {
    try {
      console.log(`Updating lesson with ID ${id} with data:`, lessonData);
      const response = await apiClient.patch<Lesson>(`/courses/lessons/${id}`, lessonData);
      console.log('Lesson updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating lesson with ID ${id}:`, error);
      throw error;
    }
  },

  deleteLesson: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting lesson with ID ${id}`);
      await apiClient.delete(`/courses/lessons/${id}`);
      console.log('Lesson deleted successfully');
    } catch (error) {
      console.error(`Error deleting lesson with ID ${id}:`, error);
      throw error;
    }
  },

  // Enrollment Management
  getEnrollments: async (courseId?: string): Promise<Enrollment[]> => {
    try {
      let url = '/courses/enrollments';
      if (courseId) url += `?courseId=${courseId}`;

      console.log('Fetching enrollments from:', url);
      const response = await apiClient.get<Enrollment[]>(url);
      console.log('Enrollments fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },

  // Bulk operations (Note: These endpoints may not exist in the API yet)
  bulkUpdateCourseStatus: async (courseIds: string[], isPublished: boolean): Promise<void> => {
    try {
      console.log(`Bulk updating status for ${courseIds.length} courses to ${isPublished ? 'published' : 'draft'}`);
      // For now, update each course individually since bulk endpoints may not exist
      const updatePromises = courseIds.map(id =>
        apiClient.patch(`/courses/${id}`, { isPublished })
      );
      await Promise.all(updatePromises);
      console.log('Bulk status update completed successfully');
    } catch (error) {
      console.error('Error in bulk status update:', error);
      throw error;
    }
  },

  bulkDeleteCourses: async (courseIds: string[]): Promise<void> => {
    try {
      console.log(`Bulk deleting ${courseIds.length} courses`);
      // For now, delete each course individually since bulk endpoints may not exist
      const deletePromises = courseIds.map(id =>
        apiClient.delete(`/courses/${id}`)
      );
      await Promise.all(deletePromises);
      console.log('Bulk delete completed successfully');
    } catch (error) {
      console.error('Error in bulk delete:', error);
      throw error;
    }
  }
};

export default coursesService;
