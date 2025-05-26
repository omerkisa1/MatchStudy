/**
 * API Service - Direct backend communication
 */

// Backend base URL
const BACKEND_URL = 'https://matchstudy-production.up.railway.app';
// Socket URL
const SOCKET_URL = 'https://socket-production-8bf7.up.railway.app';

// API URL prefix - add /api/ prefix for Railway deployment
const API_PREFIX = '/api';

/**
 * Generic API call function with improved error handling
 * @param {string} endpoint - API endpoint (without leading slash)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function apiCall(endpoint, options = {}) {
  try {
    // Determine if we should use the API_PREFIX
    // If the endpoint already has an absolute URL, use it as is
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${BACKEND_URL}${API_PREFIX}/${endpoint}`;
    
    console.log(`API Request to: ${url}`);
    
    // 5 second timeout for fetch requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increase to 10 seconds
    
    const fetchOptions = {
      ...options,
      signal: controller.signal,
      // Add credentials to handle cookies if needed
      credentials: 'include'
    };
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Handle specific error status codes
      if (response.status === 502) {
        console.error(`502 Bad Gateway error for ${url}`);
        throw new Error(`Sunucu bağlantı hatası (502 Bad Gateway)`);
      } else {
        console.error(`API error: ${response.status} for ${url}`);
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      const text = await response.text();
      console.warn('Non-JSON response:', text);
      return { text, success: true };
    }
  } catch (error) {
    // Handle different error types
    if (error.name === 'AbortError') {
      console.error(`API timeout for ${endpoint}`);
      throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      console.error(`Network error for ${endpoint}:`, error);
      throw new Error('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.');
    } else {
      console.error(`API error for ${endpoint}:`, error);
      throw error;
    }
  }
}

/**
 * Safely get a value with a default if it's undefined
 * @param {any} value - The value to check
 * @param {any} defaultValue - Default value to return if value is undefined
 * @returns {any} - The value or default value
 */
export function safeValue(value, defaultValue = []) {
  return value !== undefined ? value : defaultValue;
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
    apiCall(`study_requests/user/${userId}`).catch(error => {
      console.error("Error fetching user study requests:", error);
      throw new Error("İstekler getirilemedi");
    }).then(response => {
      // Ensure we always return an object with requests array
      return {
        ...response,
        requests: safeValue(response?.requests, [])
      };
    }),
  
  getAllRequests: () => 
    apiCall('study_requests/all').catch(error => {
      console.error("Error fetching all study requests:", error);
      throw new Error("Tüm istekler getirilemedi");
    }).then(response => {
      return {
        ...response,
        requests: safeValue(response?.requests, [])
      };
    }),
  
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
    apiCall(`matches/user/${userId}`).then(response => {
      return {
        ...response,
        matches: safeValue(response?.matches, [])
      };
    }).catch(error => {
      console.error("Error fetching matches:", error);
      throw new Error("Eşleşmeler getirilemedi");
    }),
  
  getAllMatches: () => 
    apiCall('matches/all').then(response => {
      return {
        ...response,
        matches: safeValue(response?.matches, [])
      };
    }),
  
  getNotifications: (userId) => 
    apiCall(`matches/notifications/${userId}`).then(response => {
      return {
        ...response,
        notifications: safeValue(response?.notifications, [])
      };
    }).catch(error => {
      console.error("Error fetching notifications:", error);
      throw new Error("Bildirimler getirilemedi");
    }),
    
  getHistory: (userId) => 
    apiCall(`matches/history/${userId}`).then(response => {
      return {
        ...response,
        history: safeValue(response?.history, [])
      };
    }),
  
  createMatch: (matchData) => 
    apiCall('matches/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    }),
  
  updateMatch: (matchId, status) => 
    apiCall(`matches/update/${matchId}?status=${status}`, {
      method: 'PUT'
    }),
    
  deleteMatch: (matchId) => 
    apiCall(`matches/delete/${matchId}`, {
      method: 'DELETE'
    })
};

/**
 * Friend requests related API calls
 */
export const friendRequestsApi = {
  getFriendRequests: (userId) => 
    apiCall(`friend_requests/get_friend_requests?user_id=${userId}`).then(response => {
      return {
        ...response,
        requests: safeValue(response?.requests, [])
      };
    }),
  
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
    apiCall(`messages/${chatId}`).then(response => {
      return {
        ...response,
        messages: safeValue(response?.messages, [])
      };
    }),
  
  getLastMessage: (chatId) => 
    apiCall(`messages/last/${chatId}`),
    
  getUnreadMessages: (userId) => 
    apiCall(`messages/unread/${userId}`).then(response => {
      return {
        ...response,
        unread_counts: response?.unread_counts || {}
      };
    }),
  
  markRead: (chatId) => 
    apiCall(`messages/mark_read_by_chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    }),
    
  hideChat: (chatId, userId) => 
    apiCall(`chat/hide/${chatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    }),
    
  sendMessage: (chatId, messageData) => 
    apiCall(`messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        sender_id: messageData.sender_id,
        receiver_id: messageData.receiver_id,
        content: messageData.content,
        sent_at: messageData.sent_at || new Date().toISOString()
      })
    })
};

/**
 * Socket connection helper
 */
export function getSocketUrl() {
  return SOCKET_URL;
}

// Helper function to detect if the API is available
export async function isApiAvailable() {
  try {
    await fetch(`${BACKEND_URL}/health`, { 
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      timeout: 3000
    });
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

export default {
  userApi,
  studyRequestsApi,
  matchesApi,
  friendRequestsApi,
  chatApi,
  getSocketUrl,
  isApiAvailable
}; 