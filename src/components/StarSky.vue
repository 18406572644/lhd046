<template>
  <div class="star-sky">
    <div
      v-for="star in stars"
      :key="star.id"
      class="star"
      :style="{
        left: star.x + '%',
        top: star.y + '%',
        width: star.size + 'px',
        height: star.size + 'px',
        animationDelay: star.delay + 's',
        animationDuration: star.duration + 's'
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

const stars = ref<Star[]>([])

onMounted(() => {
  const count = 100
  for (let i = 0; i < count; i++) {
    stars.value.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2
    })
  }
})
</script>

<style scoped>
.star-sky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

.star {
  position: absolute;
  background: var(--star-color);
  border-radius: 50%;
  animation: twinkle ease-in-out infinite;
  box-shadow: 0 0 6px var(--star-color), 0 0 12px var(--shadow-color);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
