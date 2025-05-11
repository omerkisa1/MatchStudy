// Admin paneli JS dosyası
document.addEventListener('DOMContentLoaded', function() {
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
        });
    });
    
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
    
    // Logları yenile butonu
    const refreshLogsBtn = document.getElementById('refreshLogsBtn');
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', function() {
            loadLogs();
        });
    }
});

// API durumunu kontrol etme
function checkApiStatus() {
    fetch('/admin/api-status')
        .then(response => response.json())
        .then(data => {
            const apiStatus = document.getElementById('apiStatus');
            if (data.success) {
                apiStatus.textContent = 'API Durumu: Çevrimiçi';
                apiStatus.classList.add('online');
                apiStatus.classList.remove('offline');
            } else {
                apiStatus.textContent = 'API Durumu: Çevrimdışı';
                apiStatus.classList.add('offline');
                apiStatus.classList.remove('online');
            }
        })
        .catch(error => {
            const apiStatus = document.getElementById('apiStatus');
            apiStatus.textContent = 'API Durumu: Çevrimdışı';
            apiStatus.classList.add('offline');
            apiStatus.classList.remove('online');
            console.error('API status error:', error);
        });
}

// İstatistik verilerini yükleme
function loadStats() {
    fetch('/admin/stats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const stats = data.stats;
                
                // Dashboard istatistiklerini güncelle
                document.getElementById('totalUsers').textContent = stats.user_count;
                document.getElementById('totalChats').textContent = stats.chat_count;
                document.getElementById('totalMessages').textContent = stats.message_count;
                document.getElementById('recentMessages').textContent = stats.recent_messages;
                
                // İstatistik sayfası verilerini güncelle
                document.getElementById('statTotalUsers').textContent = stats.user_count;
                document.getElementById('statTotalChats').textContent = stats.chat_count;
                document.getElementById('statTotalMessages').textContent = stats.message_count;
                document.getElementById('statRecentMessages').textContent = stats.recent_messages;
                
                // Grafikler
                if (typeof Chart !== 'undefined') {
                    createUserStatsChart(stats);
                    createMessageStatsChart(stats);
                }
            }
        })
        .catch(error => {
            console.error('Stats error:', error);
        });
}

// Kullanıcı grafiği oluşturma
function createUserStatsChart(stats) {
    const ctx = document.getElementById('userStatsChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Kullanıcılar'],
            datasets: [{
                data: [stats.user_count],
                backgroundColor: ['#3498db'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
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
    });
}

// Mesaj grafiği oluşturma
function createMessageStatsChart(stats) {
    const ctx = document.getElementById('messageStatsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Toplam Mesajlar', 'Son 7 Gün'],
            datasets: [{
                label: 'Mesaj Sayısı',
                data: [stats.message_count, stats.recent_messages],
                backgroundColor: ['#3498db', '#2ecc71'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
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
    });
}

// Kullanıcı verilerini yükleme
function loadUsers() {
    fetch('/admin/users')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const users = data.users;
                const usersTableBody = document.getElementById('usersTableBody');
                let usersTableHtml = '';
                
                users.forEach(user => {
                    usersTableHtml += `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name || '-'}</td>
                            <td>${user.surname || '-'}</td>
                            <td>${user.email || '-'}</td>
                            <td>${user.age || '-'}</td>
                            <td>${user.education_level || '-'}</td>
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
                
                // DataTable başlat (jQuery gerektirir)
                if (typeof $ !== 'undefined' && $.fn.DataTable) {
                    if ($.fn.DataTable.isDataTable('#usersTable')) {
                        $('#usersTable').DataTable().destroy();
                    }
                    
                    $('#usersTable').DataTable({
                        language: {
                            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/tr.json'
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Users error:', error);
        });
}

// Sohbet verilerini yükleme
function loadChats() {
    fetch('/admin/chats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const chats = data.chats;
                const chatsTableBody = document.getElementById('chatsTableBody');
                let chatsTableHtml = '';
                
                chats.forEach(chat => {
                    chatsTableHtml += `
                        <tr>
                            <td>${chat.chat_id}</td>
                            <td>${chat.user_1_name} (${chat.user_1_email})</td>
                            <td>${chat.user_2_name} (${chat.user_2_email})</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" onclick="viewChatMessages('${chat.chat_id}', '${chat.user_1_name}', '${chat.user_2_name}')">
                                    <i class="fas fa-comments"></i> Mesajlar
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                chatsTableBody.innerHTML = chatsTableHtml;
                
                // DataTable başlat (jQuery gerektirir)
                if (typeof $ !== 'undefined' && $.fn.DataTable) {
                    if ($.fn.DataTable.isDataTable('#chatsTable')) {
                        $('#chatsTable').DataTable().destroy();
                    }
                    
                    $('#chatsTable').DataTable({
                        language: {
                            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/tr.json'
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Chats error:', error);
        });
}

// Logları yükleme
function loadLogs() {
    fetch('/admin/logs')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const logs = data.logs;
                const logContainer = document.getElementById('logContainer');
                let logsHtml = '';
                
                logs.forEach(log => {
                    // Log seviyesine göre renk belirleme
                    let logClass = '';
                    if (log.includes('ERROR') || log.includes('CRITICAL')) {
                        logClass = 'text-danger';
                    } else if (log.includes('WARNING')) {
                        logClass = 'text-warning';
                    } else if (log.includes('INFO')) {
                        logClass = 'text-info';
                    }
                    
                    logsHtml += `<div class="log-entry ${logClass}">${log}</div>`;
                });
                
                logContainer.innerHTML = logsHtml;
                logContainer.scrollTop = logContainer.scrollHeight;
                
                // Dashboard için son logları da güncelle
                const recentLogs = logs.slice(-5);
                const recentLogsContainer = document.getElementById('recentLogs');
                let recentLogsHtml = '';
                
                recentLogs.forEach(log => {
                    let activityDotClass = 'activity-info';
                    if (log.includes('ERROR') || log.includes('CRITICAL')) {
                        activityDotClass = 'activity-error';
                    } else if (log.includes('WARNING')) {
                        activityDotClass = 'activity-warning';
                    }
                    
                    recentLogsHtml += `
                        <div class="log-entry">
                            <span class="activity-dot ${activityDotClass}"></span>
                            ${log}
                        </div>
                    `;
                });
                
                recentLogsContainer.innerHTML = recentLogsHtml;
            }
        })
        .catch(error => {
            console.error('Logs error:', error);
            document.getElementById('logContainer').innerHTML = '<div class="alert alert-danger">Loglar yüklenirken hata oluştu</div>';
            document.getElementById('recentLogs').innerHTML = '<div class="alert alert-danger">Loglar yüklenirken hata oluştu</div>';
        });
}

// Sohbet mesajlarını görüntüleme
function viewChatMessages(chatId, user1Name, user2Name) {
    // Seçilen sohbet başlığını güncelle
    document.getElementById('selectedChatTitle').textContent = `${user1Name} ile ${user2Name} arasındaki mesajlar`;
    
    // Mesajları yükle
    fetch(`/admin/messages/${chatId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const messages = data.messages;
                const chatMessagesContainer = document.getElementById('chatMessagesContainer');
                let messagesHtml = '';
                
                if (messages.length === 0) {
                    messagesHtml = '<div class="text-center p-5"><p>Bu sohbette henüz mesaj yok</p></div>';
                } else {
                    messages.forEach(message => {
                        const date = new Date(message.sent_at);
                        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                        
                        messagesHtml += `
                            <div class="message">
                                <div class="sender">${message.sender_name} (${message.sender_email})</div>
                                <div class="content">${message.content}</div>
                                <div class="time">${formattedDate}</div>
                            </div>
                        `;
                    });
                }
                
                chatMessagesContainer.innerHTML = messagesHtml;
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }
        })
        .catch(error => {
            console.error('Messages error:', error);
            document.getElementById('chatMessagesContainer').innerHTML = '<div class="alert alert-danger">Mesajlar yüklenirken hata oluştu</div>';
        });
}

// Kullanıcı silme
function deleteUser(userId) {
    if (confirm(`${userId} ID'li kullanıcıyı silmek istediğinize emin misiniz?`)) {
        fetch(`/admin/users/${userId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Kullanıcı başarıyla silindi');
                loadUsers(); // Kullanıcı listesini yenile
            } else {
                alert('Kullanıcı silinirken bir hata oluştu: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Delete user error:', error);
            alert('Kullanıcı silinirken bir hata oluştu');
        });
    }
}

// Kullanıcı görüntüleme
function viewUser(userId) {
    alert(`Kullanıcı detayları görüntüleniyor: ${userId}`);
    // Bu fonksiyon daha sonra geliştirilebilir
} 