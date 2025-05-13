// Admin paneli JS dosyası
document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });
    
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
    
    // Sayfa bölümleri arasında geçiş
    const navLinks = document.querySelectorAll('.nav-link, .list-group-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            
            // Aktif bölümü değiştir
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');
            
            // Aktif menü öğesini değiştir
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            document.querySelector(`.nav-link[data-section="${targetSection}"]`).classList.add('active');
            
            // Mobil görünümde sidebar'ı kapat
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    });
    
    // Ana veri yükleme fonksiyonu
    function initializeData() {
        // API durumunu kontrol et
        checkApiStatus();
        
        // İstatistik verilerini yükle
        loadStats();
        
        // Kullanıcı verilerini yükle
        loadUsers();
        
        // Sohbet verilerini yükle
        loadChats();
        
        // Logları yükle
        loadLogs();
    }
    
    // Veri yenileme zamanlaması (her 30 saniyede bir - performans için süreyi artırdık)
    let dataRefreshInterval = setInterval(initializeData, 30000);
    
    // Sayfa görünür olmadığında veri yenilemeyi durdur, görünür olduğunda yeniden başlat
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            clearInterval(dataRefreshInterval);
        } else {
            initializeData();
            dataRefreshInterval = setInterval(initializeData, 30000);
        }
    });
    
    // İlk veri yüklemesi - API hatası durumunda 3 saniye sonra bir daha dene
    initializeData();
    
    // Logları yenile butonu
    const refreshLogsBtn = document.getElementById('refreshLogsBtn');
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', function() {
            loadLogs();
        });
    }
    
    // Pencere boyutu değiştiğinde yanıt verme
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mainContent.style.marginLeft = '250px';
        } else {
            mainContent.style.marginLeft = '0';
        }
    });
    
    // İlk yükleme için pencere boyutunu kontrol et
    if (window.innerWidth <= 768) {
        mainContent.style.marginLeft = '0';
    }
});

// Güvenli fetch fonksiyonu - hata yönetimi geliştirilmiş
function safeFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.success === false && data.error) {
                    throw new Error(data.error || 'Bilinmeyen hata');
                }
                resolve(data);
            })
            .catch(error => {
                console.error(`Fetch error for ${url}:`, error);
                reject(error);
            });
    });
}

// API durumunu kontrol etme
function checkApiStatus() {
    const apiStatus = document.getElementById('apiStatus');
    if (!apiStatus) return;
    
    apiStatus.innerHTML = 'API Durumu: <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    
    safeFetch('/admin/api-status')
        .then(data => {
            if (data.success) {
                apiStatus.innerHTML = 'API Durumu: <span class="badge bg-success">Çevrimiçi</span>';
                
                // Tablo sayılarını konsola yazdır - hata ayıklama için
                if (data.table_counts) {
                    console.log('Tablo sayıları:', data.table_counts);
                }
            } else {
                apiStatus.innerHTML = 'API Durumu: <span class="badge bg-danger">Çevrimdışı</span>';
            }
        })
        .catch(error => {
            apiStatus.innerHTML = 'API Durumu: <span class="badge bg-danger">Bağlantı Hatası</span>';
        });
}

// İstatistik verilerini yükleme
function loadStats() {
    const statsElements = {
        totalUsers: document.getElementById('totalUsers'),
        totalChats: document.getElementById('totalChats'),
        totalMessages: document.getElementById('totalMessages'),
        recentMessages: document.getElementById('recentMessages'),
        statTotalUsers: document.getElementById('statTotalUsers'),
        statTotalChats: document.getElementById('statTotalChats'),
        statTotalMessages: document.getElementById('statTotalMessages'),
        statRecentMessages: document.getElementById('statRecentMessages')
    };
    
    // Eğer elementler sayfada yoksa işlem yapma
    if (!statsElements.totalUsers || !statsElements.totalChats) return;
    
    safeFetch('/admin/stats')
        .then(data => {
            if (data.success && data.stats) {
                const stats = data.stats;
                
                // Tüm istatistik elementlerini güncelle
                for (const [key, element] of Object.entries(statsElements)) {
                    if (element) {
                        // İstatistik anahtarlarını element ID'lerine eşle
                        const statKey = key.replace('stat', '').toLowerCase();
                        const value = stats[statKey] || stats.user_count || 0;
                        element.innerHTML = value;
                    }
                }
                
                // Grafikler
                if (typeof Chart !== 'undefined') {
                    createUserStatsChart(stats);
                    createMessageStatsChart(stats);
                }
            } else {
                showStatsError(statsElements);
            }
        })
        .catch(error => {
            console.error('Stats loading error:', error);
            showStatsError(statsElements);
        });
}

// İstatistik yükleme hatası durumunda gösterilecek
function showStatsError(elements) {
    for (const element of Object.values(elements)) {
        if (element) {
            element.innerHTML = '<span class="text-danger">Hata</span>';
        }
    }
}

// Chart.js grafikleri için global değişkenler
let userStatsChart = null;
let messageStatsChart = null;

// Kullanıcı grafiği oluşturma
function createUserStatsChart(stats) {
    const ctx = document.getElementById('userStatsChart');
    if (!ctx) return;
    
    const ctxContext = ctx.getContext('2d');
    if (!ctxContext) return;
    
    // Chart yapılandırması
    const chartConfig = {
        type: 'doughnut',
        data: {
            labels: ['Kullanıcılar'],
            datasets: [{
                data: [stats.user_count || 0],
                backgroundColor: ['#3498db'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Sistem Kullanıcı Sayısı'
                }
            }
        }
    };
    
    // Eğer grafik zaten varsa güncelle, yoksa oluştur
    if (userStatsChart) {
        userStatsChart.data.datasets[0].data = [stats.user_count || 0];
        userStatsChart.update();
    } else {
        userStatsChart = new Chart(ctxContext, chartConfig);
    }
}

// Mesaj grafiği oluşturma
function createMessageStatsChart(stats) {
    const ctx = document.getElementById('messageStatsChart');
    if (!ctx) return;
    
    const ctxContext = ctx.getContext('2d');
    if (!ctxContext) return;
    
    // Chart yapılandırması
    const chartConfig = {
        type: 'bar',
        data: {
            labels: ['Toplam Mesajlar', 'Son 7 Gün'],
            datasets: [{
                label: 'Mesaj Sayısı',
                data: [stats.message_count || 0, stats.recent_messages || 0],
                backgroundColor: ['#3498db', '#2ecc71'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Mesaj İstatistikleri'
                }
            }
        }
    };
    
    // Eğer grafik zaten varsa güncelle, yoksa oluştur
    if (messageStatsChart) {
        messageStatsChart.data.datasets[0].data = [stats.message_count || 0, stats.recent_messages || 0];
        messageStatsChart.update();
    } else {
        messageStatsChart = new Chart(ctxContext, chartConfig);
    }
}

// Kullanıcı verilerini yükleme
function loadUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) return;
    
    // Yükleniyor göstergesi
    usersTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Yükleniyor...</span>
                </div>
            </td>
        </tr>
    `;
    
    safeFetch('/admin/users')
        .then(data => {
            if (data.success && Array.isArray(data.users)) {
                const users = data.users;
                
                if (users.length > 0) {
                    let usersTableHtml = '';
                    
                    users.forEach(user => {
                        usersTableHtml += `
                            <tr>
                                <td>${user.id || '-'}</td>
                                <td>${escapeHtml(user.name || '-')}</td>
                                <td>${escapeHtml(user.surname || '-')}</td>
                                <td>${escapeHtml(user.email || '-')}</td>
                                <td>${user.age || '-'}</td>
                                <td>${escapeHtml(user.education_level || '-')}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="viewUser(${user.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                    
                    usersTableBody.innerHTML = usersTableHtml;
                } else {
                    usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Kullanıcı bulunamadı</td></tr>';
                }
                
                // DataTable başlat
                initializeDataTable('#usersTable');
            } else {
                const errorMsg = data.message || 'Veri yüklenirken hata oluştu';
                usersTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${escapeHtml(errorMsg)}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Users error:', error);
            usersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Veri yüklenirken bir bağlantı hatası oluştu</td></tr>';
        });
}

// DataTable başlatma yardımcı fonksiyonu
function initializeDataTable(selector) {
    if (typeof $ !== 'undefined' && $.fn.DataTable) {
        try {
            if ($.fn.DataTable.isDataTable(selector)) {
                $(selector).DataTable().destroy();
            }
            
            $(selector).DataTable({
                responsive: true,
                language: {
                url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/tr.json'

                },
                columnDefs: [
                    { responsivePriority: 1, targets: 0 },
                    { responsivePriority: 2, targets: -1 }
                ],
                order: [[0, 'desc']], // ID'ye göre sırala
                pageLength: 10,
                lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Tümü"]]
            });
        } catch (e) {
            console.error('DataTable initialization error:', e);
        }
    }
}

// Sohbet verilerini yükleme
function loadChats() {
    const chatsTableBody = document.getElementById('chatsTableBody');
    if (!chatsTableBody) return;
    
    // Yükleniyor göstergesi
    chatsTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Yükleniyor...</span>
                </div>
            </td>
        </tr>
    `;
    
    safeFetch('/admin/chats')
        .then(data => {
            if (data.success && Array.isArray(data.chats)) {
                const chats = data.chats;
                
                if (chats.length > 0) {
                    let chatsTableHtml = '';
                    
                    chats.forEach(chat => {
                        const user1Name = escapeHtml(chat.user_1_name || 'İsimsiz');
                        const user2Name = escapeHtml(chat.user_2_name || 'İsimsiz');
                        const user1Email = escapeHtml(chat.user_1_email || '');
                        const user2Email = escapeHtml(chat.user_2_email || '');
                        const chatId = escapeHtml(chat.chat_id || '');
                        
                        chatsTableHtml += `
                            <tr>
                                <td>${chatId}</td>
                                <td>${user1Name} ${user1Email ? `<small>(${user1Email})</small>` : ''}</td>
                                <td>${user2Name} ${user2Email ? `<small>(${user2Email})</small>` : ''}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="viewChatMessages('${chatId}', '${user1Name}', '${user2Name}')">
                                        <i class="fas fa-comments"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                    
                    chatsTableBody.innerHTML = chatsTableHtml;
                } else {
                    chatsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Sohbet bulunamadı</td></tr>';
                }
                
                // DataTable başlat
                initializeDataTable('#chatsTable');
            } else {
                const errorMsg = data.message || 'Veri yüklenirken hata oluştu';
                chatsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${escapeHtml(errorMsg)}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Chats error:', error);
            chatsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Veri yüklenirken bir bağlantı hatası oluştu</td></tr>';
        });
}

// Sistem loglarını yükleme
function loadLogs() {
    const logsContainer = document.getElementById('logsContainer');
    const recentLogs = document.getElementById('recentLogs');
    
    // Yükleniyor göstergesi
    const loadingHtml = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Yükleniyor...</span>
            </div>
        </div>
    `;
    
    if (logsContainer) logsContainer.innerHTML = loadingHtml;
    if (recentLogs) recentLogs.innerHTML = loadingHtml;
    
    safeFetch('/admin/logs')
        .then(data => {
            if (data.success && Array.isArray(data.logs)) {
                const logs = data.logs;
                
                if (logs && logs.length > 0) {
                    // Log girdilerini oluştur
                    let logsHtml = '';
                    logs.forEach(log => {
                        // Log düzenleme ve biçimlendirme
                        const parsedLog = parseLogEntry(log);
                        
                        logsHtml += parsedLog.html;
                    });
                    
                    // Ana loglar sayfasını güncelle
                    if (logsContainer) {
                        logsContainer.innerHTML = logsHtml;
                        logsContainer.scrollTop = logsContainer.scrollHeight;
                    }
                    
                    // Dashboard son loglar bölümünü güncelle
                    if (recentLogs) {
                        // Son 5 logu al
                        const recentLogsHtml = logs.slice(-5).reverse().map(log => {
                            const parsedLog = parseLogEntry(log);
                            
                            // Dashboard için daha kompakt bir log formatı
                            return `
                                <div class="log-entry ${parsedLog.logClass}">
                                    <span class="activity-dot ${parsedLog.dotClass}"></span>
                                    <small class="log-timestamp">${parsedLog.timestamp}</small>
                                    <span class="log-level ${parsedLog.levelClass}">${parsedLog.level}</span>
                                    <span>${escapeHtml(parsedLog.shortContent)}</span>
                                </div>
                            `;
                        }).join('');
                        
                        recentLogs.innerHTML = recentLogsHtml || '<div class="text-center p-3">Henüz log kaydı bulunmuyor</div>';
                    }
                } else {
                    const noLogsHtml = '<div class="text-center p-3">Henüz log kaydı bulunmuyor</div>';
                    if (logsContainer) logsContainer.innerHTML = noLogsHtml;
                    if (recentLogs) recentLogs.innerHTML = noLogsHtml;
                }
            } else {
                const errorMsg = data.message || 'Loglar yüklenirken hata oluştu';
                const errorHtml = `<div class="text-center text-danger p-3">${escapeHtml(errorMsg)}</div>`;
                if (logsContainer) logsContainer.innerHTML = errorHtml;
                if (recentLogs) recentLogs.innerHTML = errorHtml;
            }
        })
        .catch(error => {
            console.error('Logs error:', error);
            const errorHtml = '<div class="text-center text-danger p-3">Loglar yüklenirken bir bağlantı hatası oluştu</div>';
            if (logsContainer) logsContainer.innerHTML = errorHtml;
            if (recentLogs) recentLogs.innerHTML = errorHtml;
        });
}

// Log girişini ayrıştırıp format verme
function parseLogEntry(log) {
    let logClass = '';
    let dotClass = 'activity-info';
    let level = 'INFO';
    let levelClass = 'info';
    let logType = 'system';
    
    // Log seviyesini belirle
    if (log.includes('ERROR') || log.includes('error')) {
        logClass = 'text-danger';
        dotClass = 'activity-error';
        level = 'ERROR';
        levelClass = 'error';
    } else if (log.includes('WARNING') || log.includes('warning')) {
        logClass = 'text-warning';
        dotClass = 'activity-warning';
        level = 'WARNING';
        levelClass = 'warning';
    } else if (log.includes('INFO') || log.includes('info')) {
        logClass = 'text-info';
        level = 'INFO';
        levelClass = 'info';
    }
    
    // Zaman damgasını ayır (tipik log formatı: "2023-05-25 14:30:45,123 - ...")
    let timestamp = '';
    let content = log;
    
    const timestampMatch = log.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),\d{3}/);
    if (timestampMatch && timestampMatch[1]) {
        timestamp = timestampMatch[1];
        // Zaman damgasından sonraki kısmı içerik olarak al
        content = log.substring(log.indexOf(' - ') + 3);
    }
    
    // Client log tipini belirle
    if (log.includes('[CLIENT-INFO]') || log.includes('[CLIENT LOG]')) {
        logType = 'client';
        
        // Alt kategorileri belirle
        if (log.includes('video_stream')) logType = 'client_video';
        else if (log.includes('mouse_move')) logType = 'client_mouse';
        else if (log.includes('click')) logType = 'client_click';
        else if (log.includes('user_input')) logType = 'client_input';
        else if (log.includes('visibility_change')) logType = 'client_visibility';
        else if (log.includes('battery_status')) logType = 'client_battery';
    }
    
    // Modül adını (varsa) ayır (tipik format: "module_name - message")
    let module = '';
    let message = content;
    
    const moduleMatch = content.match(/^([a-zA-Z0-9_]+) - (.*)/);
    if (moduleMatch) {
        module = moduleMatch[1];
        message = moduleMatch[2];
    }
    
    // İçerik kısmını temizle ve kısalt
    const shortContent = message.length > 100 ? message.substring(0, 100) + '...' : message;
    
    // Sadece tarihi ve saati ayır
    let dateOnly = '';
    let timeOnly = '';
    if (timestamp) {
        const timestampParts = timestamp.split(' ');
        if (timestampParts.length === 2) {
            dateOnly = timestampParts[0];
            timeOnly = timestampParts[1];
        }
    }
    
    // İstemci log bilgilerini çıkart
    let clientData = {};
    if (logType.startsWith('client')) {
        try {
            // JSON içeriğini bul ve ayrıştır
            const jsonMatch = message.match(/\{.*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                clientData = JSON.parse(jsonStr);
            }
        } catch (e) {
            console.warn('Client log JSON parsing failed:', e);
        }
    }
    
    // Log badge türünü belirle
    let logBadge = '';
    if (logType === 'client_video') {
        logBadge = '<span class="badge bg-purple ms-2">Video</span>';
    } else if (logType === 'client_mouse') {
        logBadge = '<span class="badge bg-secondary ms-2">Mouse</span>';
    } else if (logType === 'client_click') {
        logBadge = '<span class="badge bg-success ms-2">Tıklama</span>';
    } else if (logType === 'client_input') {
        logBadge = '<span class="badge bg-warning text-dark ms-2">Giriş</span>';
    } else if (logType.startsWith('client')) {
        logBadge = '<span class="badge bg-info ms-2">İstemci</span>';
    }
    
    // HTML formatında log girişi oluştur
    const html = `
        <div class="log-entry ${logClass}" data-level="${level.toLowerCase()}" data-timestamp="${timestamp}" data-module="${module}" data-type="${logType}">
            <div class="d-flex align-items-center">
                <span class="log-timestamp me-2">${timeOnly}</span>
                <span class="log-level ${levelClass}">${level}</span>
                ${module ? `<span class="badge bg-secondary ms-2">${module}</span>` : ''}
                ${logBadge}
            </div>
            <span class="log-content">${escapeHtml(message)}</span>
            <small class="text-muted d-block mt-1">${dateOnly}</small>
        </div>
    `;
    
    return {
        html,
        logClass,
        dotClass,
        level,
        levelClass,
        timestamp,
        dateOnly,
        timeOnly,
        module,
        content,
        message,
        shortContent,
        logType,
        clientData
    };
}

// HTML karakterlerini escape etme yardımcı fonksiyonu
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
        return '';
    }
    
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Belirli bir sohbetin mesajlarını görüntüleme
function viewChatMessages(chatId, user1Name, user2Name) {
    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const selectedChatTitle = document.getElementById('selectedChatTitle');
    const messageCountElement = document.getElementById('messageCount');
    
    if (!chatId || !chatMessagesContainer) {
        console.error('Chat ID or container is missing');
        return;
    }
    
    // Yükleniyor göstergesi
    chatMessagesContainer.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Mesajlar yükleniyor...</span>
            </div>
        </div>
    `;
    
    // Başlığı güncelle
    if (selectedChatTitle) {
        selectedChatTitle.textContent = `${user1Name || 'Kullanıcı 1'} ve ${user2Name || 'Kullanıcı 2'} arasındaki sohbet`;
    }
    
    safeFetch(`/admin/messages/${chatId}`)
        .then(data => {
            if (data.success && Array.isArray(data.messages)) {
                const messages = data.messages;
                
                // Mesaj sayısını güncelle
                if (messageCountElement) {
                    messageCountElement.textContent = `${messages.length} mesaj`;
                }
                
                if (messages.length > 0) {
                    let messagesHtml = '';
                    let currentDay = '';
                    
                    messages.forEach(message => {
                        try {
                            const sentDate = new Date(message.sent_at);
                            const messageDate = sentDate.toLocaleDateString('tr-TR');
                            const messageTime = sentDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                            const senderName = escapeHtml(message.sender_name || 'İsimsiz Kullanıcı');
                            const content = escapeHtml(message.content || '');
                            
                            // Gün değişimini kontrol et ve tarih ayırıcısı ekle
                            if (messageDate !== currentDay) {
                                currentDay = messageDate;
                                messagesHtml += `
                                    <div class="message-date-separator">
                                        <span>${messageDate}</span>
                                    </div>
                                `;
                            }
                            
                            messagesHtml += `
                                <div class="message">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <div class="sender">${senderName}</div>
                                        <div class="time badge bg-light text-dark">${messageTime}</div>
                                    </div>
                                    <div class="content">${content}</div>
                                </div>
                            `;
                        } catch (err) {
                            console.error('Error processing message:', err, message);
                        }
                    });
                    
                    chatMessagesContainer.innerHTML = messagesHtml;
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                } else {
                    chatMessagesContainer.innerHTML = `
                        <div class="text-center p-5">
                            <i class="fas fa-comments text-muted" style="font-size: 3rem; opacity: 0.2;"></i>
                            <p class="mt-3">Bu sohbette henüz mesaj bulunmuyor</p>
                        </div>
                    `;
                    
                    if (messageCountElement) {
                        messageCountElement.textContent = '0 mesaj';
                    }
                }
            } else {
                const errorMsg = data.message || 'Mesajlar yüklenirken bir hata oluştu';
                chatMessagesContainer.innerHTML = `
                    <div class="text-center p-5 text-danger">
                        <i class="fas fa-exclamation-circle" style="font-size: 3rem;"></i>
                        <p class="mt-3">${escapeHtml(errorMsg)}</p>
                    </div>
                `;
                
                if (messageCountElement) {
                    messageCountElement.textContent = 'Hata';
                }
            }
        })
        .catch(error => {
            console.error('Messages error:', error);
            chatMessagesContainer.innerHTML = `
                <div class="text-center p-5 text-danger">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem;"></i>
                    <p class="mt-3">Mesajlar yüklenirken bir bağlantı hatası oluştu</p>
                </div>
            `;
            
            if (messageCountElement) {
                messageCountElement.textContent = 'Bağlantı hatası';
            }
        });
}

// Kullanıcı silme
function deleteUser(userId) {
    if (!userId) {
        console.error('User ID is required');
        return;
    }
    
    if (!confirm(`${userId} ID'li kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm ilişkili veriler de silinecektir.`)) {
        return;
    }
    
    // Yükleniyor göstergesi
    const userRow = document.querySelector(`#usersTableBody tr td:first-child:contains('${userId}')`).closest('tr');
    if (userRow) {
        userRow.classList.add('table-warning');
    }
    
    fetch(`/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('✅ Kullanıcı başarıyla silindi.');
                loadUsers();  // Kullanıcı listesini yenile
                loadStats();  // İstatistikleri güncelle
                loadChats();  // Sohbetleri güncelle
            } else {
                alert(`❌ Hata: ${data.message || 'Kullanıcı silinirken bir hata oluştu.'}`);
                if (userRow) {
                    userRow.classList.remove('table-warning');
                }
            }
        })
        .catch(error => {
            console.error('Delete user error:', error);
            alert('❌ Kullanıcı silinirken bir bağlantı hatası oluştu. Lütfen tekrar deneyin.');
            if (userRow) {
                userRow.classList.remove('table-warning');
            }
        });
}

// Kullanıcı detaylarını görüntüleme
function viewUser(userId) {
    if (!userId) {
        console.error('User ID is required');
        return;
    }
    
    // Gelecekte burada bir modal veya popup ile kullanıcı detaylarını gösterebiliriz
    alert(`Kullanıcı detayları görüntüleme özelliği henüz geliştirilme aşamasındadır. Kullanıcı ID: ${userId}`);
}

// jQuery yardımcı fonksiyonu - contains seçici - kullanıcı silme kısmı için
if (typeof jQuery !== 'undefined') {
    jQuery.expr[':'].contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };
} 