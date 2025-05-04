<template>
  <div class="dashboard-grid">
    <DashboardCard 
      icon="✏️"
      title="Ders İsteği Oluştur"
      description="Öğrenmek istediğiniz konularda eşleşmeler bulmak için ders isteği oluşturun."
      cta="Şimdi Başla →"
      target="create-request"
      :navigateTo="navigate"
    />
    
    <DashboardCard 
      icon="🔍"
      title="Keşfet"
      description="Diğer öğrencilerin ders isteklerini keşfedin ve ilgi duyduğunuz konulara katılın."
      cta="Keşfet →"
      target="discover"
      :navigateTo="navigate"
    />
    
    <DashboardCard 
      icon="👤"
      title="Profil"
      description="Profilinizi özelleştirin, ilgi alanlarınızı belirtin ve eşleşme şansınızı artırın."
      cta="Profili Düzenle →"
      target="profile"
      :navigateTo="navigate"
    />
    
    <DashboardCard 
      icon="🔔"
      title="Bildirimler"
      description="Yeni eşleşmeler ve ders isteği güncellemeleri hakkında bildirimlerinizi görüntüleyin."
      cta="Bildirimleri Gör →"
      target="notifications"
      :navigateTo="navigate"
    />
  </div>
</template>

<script>
import DashboardCard from './DashboardCard.vue';

export default {
  name: "DashboardCards",
  components: {
    DashboardCard
  },
  setup(props, { emit }) {
    const navigate = (destination) => {
      emit('navigate', destination);
    };
    
    return {
      navigate
    };
  }
}
</script>

<style>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style> 