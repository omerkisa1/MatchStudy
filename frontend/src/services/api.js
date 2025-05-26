/**
 * API Service - Direct backend communication
 */

// Backend base URL
const BACKEND_URL = 'https://matchstudy-production.up.railway.app';
// Socket URL
const SOCKET_URL = 'https://socket-production-8bf7.up.railway.app';

/**
 * Generic API call function with improved error handling
 * @param {string} endpoint - API endpoint (without leading slash)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
export async function apiCall(endpoint, options = {}) {
  try {
    const url = `${BACKEND_URL}/${endpoint}`;
    
    // 5 second timeout for fetch requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Handle specific error status codes
      if (response.status === 502) {
        throw new Error(`Sunucu bağlantı hatası (502 Bad Gateway)`);
      } else {
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
    }),
  
  getAllRequests: () => 
    apiCall('study_requests/all').catch(error => {
      console.error("Error fetching all study requests:", error);
      throw new Error("Tüm istekler getirilemedi");
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
    apiCall(`matches/user/${userId}`),
  
  getAllMatches: () => 
    apiCall('matches/all'),
  
  getNotifications: (userId) => 
    apiCall(`matches/notifications/${userId}`).catch(error => {
      console.error("Error fetching notifications:", error);
      throw new Error("Bildirimler getirilemedi");
    }),
    
  getHistory: (userId) => 
    apiCall(`matches/history/${userId}`),
  
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
  
  getLastMessage: (chatId) => 
    apiCall(`messages/last/${chatId}`),
    
  getUnreadMessages: (userId) => 
    apiCall(`messages/unread/${userId}`),
  
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