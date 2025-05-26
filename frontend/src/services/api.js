/**
 * API Service - Direct backend communication
 */

// Backend base URL
const BACKEND_URL = 'https://matchstudy-production.up.railway.app';
// Socket URL
const SOCKET_URL = 'https://socket-production-8bf7.up.railway.app';

/**
 * Generic API call function
 * @param {string} endpoint - API endpoint (without leading slash)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function apiCall(endpoint, options = {}) {
  try {
    const url = `${BACKEND_URL}/${endpoint}`;
    console.log(`API Request to: ${url}`, options);
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      const text = await response.text();
      console.warn('Non-JSON response:', text);
      return { text };
    }
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * User related API calls
 */
export const userApi = {
  login: (email, password) => 
    apiCall(`users/get_id?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`),
  
  getUser: (userId) => 
    apiCall(`users/user/${userId}`),
  
  updateUser: (userId, userData) => 
    apiCall(`users/update/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
};

/**
 * Study requests related API calls
 */
export const studyRequestsApi = {
  getUserRequests: (userId) => 
    apiCall(`study_requests/user/${userId}`),
  
  getAllRequests: () => 
    apiCall('study_requests/all'),
  
  createRequest: (requestData) => 
    apiCall('study_requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    }),
  
  deleteRequest: (requestId) => 
    apiCall(`study_requests/delete/${requestId}`, {
      method: 'DELETE'
    })
};

/**
 * Matches related API calls
 */
export const matchesApi = {
  getUserMatches: (userId) => 
    apiCall(`matches/user/${userId}`),
  
  getNotifications: (userId) => 
    apiCall(`matches/notifications/${userId}`),
  
  createMatch: (matchData) => 
    apiCall('matches/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    }),
  
  updateMatch: (matchId, status) => 
    apiCall(`matches/update/${matchId}?status=${status}`, {
      method: 'PUT'
    })
};

/**
 * Friend requests related API calls
 */
export const friendRequestsApi = {
  getFriendRequests: (userId) => 
    apiCall(`friend_requests/get_friend_requests?user_id=${userId}`),
  
  sendFriendRequest: (senderId, receiverId) => 
    apiCall(`friend_requests/send?sender_id=${senderId}&receiver_id=${receiverId}`, {
      method: 'POST'
    }),
  
  manageFriendRequest: (senderId, receiverId, status) => 
    apiCall(`friend_requests/manage?sender_id=${senderId}&receiver_id=${receiverId}&status=${status}`, {
      method: 'POST'
    })
};

/**
 * Chat and messages related API calls
 */
export const chatApi = {
  getChat: (userId1, userId2) => 
    apiCall(`chat/${userId1}/${userId2}`),
  
  getMessages: (chatId) => 
    apiCall(`messages/${chatId}`),
  
  getUnreadMessages: (userId) => 
    apiCall(`messages/unread/${userId}`),
  
  markRead: (chatId) => 
    apiCall(`messages/mark_read_by_chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    })
};

/**
 * Socket connection helper
 */
export function getSocketUrl() {
  return SOCKET_URL;
}

export default {
  userApi,
  studyRequestsApi,
  matchesApi,
  friendRequestsApi,
  chatApi,
  getSocketUrl
}; 