<template>
  <header class="main-nav desktop-nav">
    <div class="nav-container">
      <div class="nav-logo">
        <StarOutline class="logo-icon" />
        <span class="logo-text">星运指南</span>
      </div>
      <nav class="nav-menu">
        <router-link
          v-for="item in desktopMenu"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: route.path === item.path }"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </nav>
    </div>
  </header>

  <nav class="mobile-nav">
    <router-link
      v-for="item in mobileMenu"
      :key="item.path"
      :to="item.path"
      class="mobile-nav-item"
      :class="{ active: route.path === item.path }"
    >
      <component :is="item.icon" class="mobile-nav-icon" />
      <span class="mobile-nav-text">{{ item.name }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  HomeOutline,
  TodayOutline,
  HeartOutline,
  PersonOutline,
  GiftOutline,
  BookOutline,
  NotificationsOutline,
  StarOutline,
  BookmarkOutline,
  BarChartOutline
} from '@vicons/ionicons5'

const route = useRoute()

interface MenuItem {
  name: string
  path: string
  icon: typeof HomeOutline
}

const desktopMenu: MenuItem[] = [
  { name: '首页', path: '/', icon: HomeOutline },
  { name: '每日运势', path: '/fortune', icon: TodayOutline },
  { name: '运势趋势', path: '/trend', icon: BarChartOutline },
  { name: '星座配对', path: '/compatibility', icon: HeartOutline },
  { name: '性格分析', path: '/personality', icon: PersonOutline },
  { name: '幸运物', path: '/lucky', icon: GiftOutline },
  { name: '星座知识', path: '/knowledge', icon: BookOutline },
  { name: '提醒设置', path: '/reminder', icon: NotificationsOutline },
  { name: '我的收藏', path: '/favorites', icon: BookmarkOutline }
]

const mobileMenu: MenuItem[] = [
  { name: '首页', path: '/', icon: HomeOutline },
  { name: '运势', path: '/fortune', icon: TodayOutline },
  { name: '趋势', path: '/trend', icon: BarChartOutline },
  { name: '配对', path: '/compatibility', icon: HeartOutline },
  { name: '收藏', path: '/favorites', icon: StarOutline }
]
</script>

<style scoped>
.main-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(26, 26, 62, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  font-size: 28px;
  color: #ffd700;
  -webkit-text-fill-color: #ffd700;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 12px;
  color: #c9b6e4;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #f0f0ff;
  background: rgba(168, 85, 247, 0.15);
}

.nav-link.active {
  color: #f0f0ff;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(168, 85, 247, 0.2));
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.8);
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  white-space: nowrap;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 70px;
  background: rgba(26, 26, 62, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  color: #c9b6e4;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.mobile-nav-item:hover {
  color: #f0f0ff;
}

.mobile-nav-item.active {
  color: #f0f0ff;
}

.mobile-nav-item.active .mobile-nav-icon {
  transform: translateY(-2px);
  filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6));
}

.mobile-nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: linear-gradient(135deg, #00d4ff, #a855f7);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
}

.mobile-nav-icon {
  font-size: 24px;
  transition: all 0.3s ease;
}

.mobile-nav-text {
  font-size: 11px;
  font-weight: 500;
}

@media (min-width: 769px) {
  .mobile-nav {
    display: none;
  }
  .desktop-nav {
    display: block;
  }
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  .mobile-nav {
    display: flex;
  }
}
</style>
