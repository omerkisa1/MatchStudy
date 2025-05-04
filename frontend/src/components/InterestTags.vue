<template>
  <div class="interests-section">
    <h3 v-if="showTitle">{{ title }}</h3>
    <div class="interests-container">
      <span v-for="interest in interests" 
            :key="interest" 
            class="interest-tag">
        {{ interest }}
        <button v-if="removable" class="remove-interest" @click="handleRemoveInterest(interest)">&times;</button>
      </span>
      <slot></slot>
      <button v-if="showAddButton" class="add-interest-btn" @click="emitAddInterest">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ addButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "InterestTags",
  props: {
    interests: {
      type: Array,
      required: true,
      default: () => []
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: "İlgi Alanları"
    },
    showAddButton: {
      type: Boolean,
      default: true
    },
    addButtonText: {
      type: String,
      default: "İlgi Alanı Ekle"
    },
    removable: {
      type: Boolean,
      default: true
    }
  },
  emits: ["add-interest", "remove-interest"],
  setup(props, { emit }) {
    // Handler for removing an interest
    const handleRemoveInterest = (interest) => {
      emit("remove-interest", interest);
    };

    // Handler for adding an interest
    const emitAddInterest = () => {
      emit("add-interest");
    };

    return {
      handleRemoveInterest,
      emitAddInterest
    };
  }
}
</script>

<style scoped>
.interests-section {
  margin-top: 2rem;
}

.interests-section h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.interests-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.interest-tag {
  background: rgba(126, 87, 194, 0.15);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px solid rgba(126, 87, 194, 0.3);
}

.add-interest-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-interest-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.add-interest-btn svg {
  width: 16px;
  height: 16px;
}

.remove-interest {
  background: none;
  border: none;
  color: var(--text-secondary);
  margin-left: 0.25rem;
  cursor: pointer;
  opacity: 0.7;
}

.remove-interest:hover {
  opacity: 1;
}
</style> 