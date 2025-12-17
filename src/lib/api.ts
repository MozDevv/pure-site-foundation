/* eslint-disable no-useless-catch */
import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api'; //
// export const API_BASE_URL = 'https://techaipath.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add this interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errMsg =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      '';
    if (
      typeof errMsg === 'string' &&
      errMsg.includes('io.jsonwebtoken.ExpiredJwtException')
    ) {
      alert('Session expired. Please log in again.');
      // Optionally, clear token and redirect to login:
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

  // Courses
  getAllCourses: '/courses',
  createCourse: '/courses',
  updateCourse: `/courses`,
  deleteCourse: (courseId: string) => `/courses/${courseId}`,
  getCourseById: (courseId: string) => `/courses/${courseId}`,
  forgotPassword: (userId: string) =>
    `/v1/auth/forgot-password?userId=${userId}`,
  forgotPasswordEmail: (email: string) =>
    `/v1/auth/forgot-password?email=${email}`,
  changePassword: (id: string) => `/v1/auth/change-password/${id}`,

  getIntegrationDetails: '/events/getGoogleIntergrationDetails',
  googleCalendarCallback: (code: string) => `/events/callback?code=${code}`,
  addMembersToCourse: (courseId: string) => `/courses/add-members/${courseId}`,
  removeMemberFromCourse: (courseId: string) =>
    `/courses/remove-members/${courseId}`,
  addTutorsToCourse: (courseId: string) =>
    `/courses/add-members/${courseId}?isStudents=false`,
  createEvent: '/events/create',
  getUserEvents: '/events',
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
  login: async (endpoint, data?) => {
    try {
      // setAuthorizationHeader();
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
