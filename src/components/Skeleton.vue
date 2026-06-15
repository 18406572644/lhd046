<template>
  <div
    class="skeleton-wrapper"
    :class="{ 'skeleton-animated': animated }"
    :style="{ width, height }"
  >
    <template v-if="type === 'text'">
      <div
        v-for="i in rows"
        :key="i"
        class="skeleton-text"
        :style="{
          width: `${100 - (i % 3) * 15}%`,
          height: `${rowHeight}px`,
          marginBottom: `${rowGap}px`
        }"
      ></div>
    </template>

    <template v-else-if="type === 'card'">
      <div class="skeleton-card">
        <div class="skeleton-card-avatar"></div>
        <div class="skeleton-card-content">
          <div class="skeleton-card-title"></div>
          <div class="skeleton-card-subtitle"></div>
          <div class="skeleton-card-text"></div>
        </div>
      </div>
    </template>

    <template v-else-if="type === 'list'">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton-list-icon"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-list-title"></div>
          <div class="skeleton-list-subtitle"></div>
        </div>
      </div>
    </template>

    <template v-else-if="type === 'grid'">
      <div class="skeleton-grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
        <div v-for="i in count" :key="i" class="skeleton-grid-item">
          <div class="skeleton-grid-icon"></div>
          <div class="skeleton-grid-title"></div>
          <div class="skeleton-grid-subtitle"></div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="skeleton-custom"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'text' | 'card' | 'list' | 'grid' | 'custom'
  animated?: boolean
  rows?: number
  rowHeight?: number
  rowGap?: number
  count?: number
  cols?: number
  width?: string
  height?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  animated: true,
  rows: 3,
  rowHeight: 16,
  rowGap: 12,
  count: 6,
  cols: 3,
  width: '100%',
  height: 'auto'
})
</script>

<style scoped>
.skeleton-wrapper {
  overflow: hidden;
}

.skeleton-animated {
  position: relative;
}

.skeleton-animated::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(167, 139, 250, 0.2),
    transparent
  );
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.skeleton-text,
.skeleton-card-avatar,
.skeleton-card-title,
.skeleton-card-subtitle,
.skeleton-card-text,
.skeleton-list-icon,
.skeleton-list-title,
.skeleton-list-subtitle,
.skeleton-grid-icon,
.skeleton-grid-title,
.skeleton-grid-subtitle,
.skeleton-custom {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.skeleton-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.skeleton-card-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card-title {
  height: 24px;
  width: 60%;
}

.skeleton-card-subtitle {
  height: 16px;
  width: 40%;
}

.skeleton-card-text {
  height: 16px;
  width: 85%;
}

.skeleton-list-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.skeleton-list-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.skeleton-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.skeleton-list-title {
  height: 18px;
  width: 70%;
}

.skeleton-list-subtitle {
  height: 14px;
  width: 50%;
}

.skeleton-grid {
  display: grid;
  gap: 16px;
}

.skeleton-grid-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-grid-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
}

.skeleton-grid-title {
  height: 18px;
  width: 80%;
}

.skeleton-grid-subtitle {
  height: 14px;
  width: 60%;
}

@media (max-width: 768px) {
  .skeleton-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
