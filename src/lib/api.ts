/* eslint-disable no-useless-catch */
import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api'; //

const api = axios.create({
  baseURL: API_BASE_URL,
});

const setAuthorizationHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
/**
 * const {
  data,
  error,
  isLoading,
  isFetching,
  isError,
  refetch,
} = useQuery({
  queryKey: ['team', teamId],
  queryFn: () => apiService.get(endpoints.getTeamById(teamId)).then(res => res.data),
});
})
 */
export const endpoints = {
  login: '/v1/auth/login',
  register: '/v1/auth/register',
  getProfile: '/v1/auth/profile',
  updateProfile: '/v1/auth/profile',

  createProfile: '/user-profile',
  getAllUsers: '/users/all',
  getAllRoles: '/roles/all',
  activateAccount: (userId: string) => `/v1/auth/activate?userId=${userId}`,
  approveStudentApplication: (userId: string) =>
    `/v1/auth/approve-student?userId=${userId}`,
  changePassword: (userId: string) => `/v1/auth/change-password/${userId}`,
  requestPasswordResetOtp: (userId: string) => `/v1/auth/request-otp/${userId}`,
  
  // Courses
  getAllCourses: '/api/courses',
  createCourse: '/api/courses',
  updateCourse: (courseId: string) => `/api/courses/${courseId}`,
  deleteCourse: (courseId: string) => `/api/courses/${courseId}`,
  getCourseById: (courseId: string) => `/api/courses/${courseId}`,
};

export const apiService = {
  getWithParams: async (endpoint, params) => {
    try {
      setAuthorizationHeader(); // Set Authorizcation header beore making the request
      const response = await api.get(endpoint, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
  get: async (endpoint) => {
    try {
      setAuthorizationHeader(); // Set Authorization header before making the request
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  post: async (endpoint, data?) => {
    try {
      setAuthorizationHeader();
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  login: async (endpoint, data) => {
    try {
      setAuthorizationHeader();
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      setAuthorizationHeader();
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  delete: async (endpoint) => {
    try {
      setAuthorizationHeader();
      const response = await api.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
