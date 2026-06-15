<template>
  <div class="reminder-view">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <h1 class="page-title">智能提醒中心</h1>
      <p class="page-subtitle">智能检测运势波动，及时推送重要提醒</p>

      <NTabs v-model:value="activeTab" type="line" size="large" class="main-tabs">
        <NTabPane name="smart" :tab="`智能提醒 ${userStore.unreadSmartRemindersCount > 0 ? `(${userStore.unreadSmartRemindersCount})` : ''}`" />
        <NTabPane name="events" tab="星象日历" />
        <NTabPane name="custom" tab="自定义提醒" />
        <NTabPane name="settings" tab="提醒设置" />
      </NTabs>

      <template v-if="activeTab === 'smart'">
        <div class="smart-reminder-header">
          <div class="smart-stats">
            <div class="smart-stat">
              <div class="stat-num">{{ userStore.smartReminders.length }}</div>
              <div class="stat-label">总提醒数</div>
            </div>
            <div class="smart-stat">
              <div class="stat-num">{{ userStore.unreadSmartRemindersCount }}</div>
              <div class="stat-label">未读</div>
            </div>
            <div class="smart-stat">
              <div class="stat-num">{{ fortuneWarningCount }}</div>
              <div class="stat-label">运势预警</div>
            </div>
            <div class="smart-stat">
              <div class="stat-num">{{ astronomicalCount }}</div>
              <div class="stat-label">星象提醒</div>
            </div>
          </div>
          <div class="smart-actions">
            <NButton 
              size="small" 
              @click="handleMarkAllRead" 
              :disabled="userStore.unreadSmartRemindersCount === 0"
            >
              全部已读
            </NButton>
            <NButton 
              size="small" 
              type="error" 
              ghost
              @click="handleClearAll" 
              :disabled="userStore.smartReminders.length === 0"
            >
              清空记录
            </NButton>
            <NButton 
              size="small" 
              type="primary" 
              @click="handleGenerateReminder"
              :loading="generating"
            >
              <template #icon>
                <NIcon :component="RefreshOutline" />
              </template>
              立即检测
            </NButton>
          </div>
        </div>

        <NEmpty v-if="userStore.smartReminders.length === 0" class="empty-state" description="暂无智能提醒记录，点击「立即检测」生成今日提醒">
          <template #icon>
            <div class="empty-icon">🔔</div>
          </template>
        </NEmpty>

        <NList v-else class="smart-reminder-list">
          <NListItem 
            v-for="reminder in userStore.sortedSmartReminders" 
            :key="reminder.id" 
            class="smart-reminder-item"
            :class="{ unread: !reminder.read }"
            @click="handleReminderClick(reminder)"
          >
            <NCard class="glass-card smart-reminder-card" bordered="false">
              <div class="smart-reminder-header-row">
                <div class="reminder-type-icon" :class="reminder.type">
                  {{ reminder.type === 'fortune_warning' ? '📊' : reminder.astronomicalEvent?.icon || '✨' }}
                </div>
                <div class="smart-reminder-main">
                  <div class="smart-reminder-title-row">
                    <span class="smart-reminder-title">{{ reminder.title }}</span>
                    <NBadge v-if="!reminder.read" dot type="error" />
                  </div>
                  <div class="smart-reminder-meta">
                    <NTag size="small" :type="getDirectionTagType(reminder.direction)">
                      {{ getDirectionText(reminder.direction) }}
                    </NTag>
                    <NTag size="small" type="info">
                      {{ getSensitivityText(reminder.sensitivity) }}
                    </NTag>
                    <span class="reminder-time">{{ formatTime(reminder.triggeredAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="smart-reminder-content">
                <p class="reminder-content-text">{{ reminder.content }}</p>
                
                <div v-if="reminder.affectedAreas.length > 0" class="affected-areas">
                  <span class="affected-label">影响领域：</span>
                  <NTag 
                    v-for="area in reminder.affectedAreas" 
                    :key="area" 
                    size="small"
                    class="area-tag"
                  >
                    {{ area }}
                  </NTag>
                </div>

                <div v-if="reminder.scoreChange !== undefined" class="score-change-info">
                  <span class="score-label">今日 {{ reminder.currentScore }}分</span>
                  <span class="score-divider">/</span>
                  <span class="score-label">7日均 {{ reminder.averageScore }}分</span>
                  <span 
                    class="score-change"
                    :class="{ positive: (reminder.scoreChange || 0) > 0, negative: (reminder.scoreChange || 0) < 0 }"
                  >
                    {{ (reminder.scoreChange || 0) > 0 ? '+' : '' }}{{ reminder.scoreChange }}
                  </span>
                </div>

                <div class="reminder-advice">
                  <span class="advice-label">💡 建议：</span>
                  <span class="advice-text">{{ reminder.advice }}</span>
                </div>
              </div>

              <div class="smart-reminder-footer">
                <NButton 
                  size="small" 
                  text 
                  type="error" 
                  @click.stop="handleDeleteSmartReminder(reminder.id)"
                >
                  <template #icon>
                    <NIcon :component="TrashOutline" />
                  </template>
                  删除
                </NButton>
              </div>
            </NCard>
          </NListItem>
        </NList>
      </template>

      <template v-else-if="activeTab === 'events'">
        <NCard class="glass-card events-card" bordered="false">
          <div class="events-header">
            <div class="section-title">即将到来的星象事件</div>
            <NButton size="small" @click="loadEvents" :loading="eventsLoading">
              <template #icon>
                <NIcon :component="RefreshOutline" />
              </template>
              刷新
            </NButton>
          </div>

          <NSpin v-if="eventsLoading" size="large" />
          
          <template v-else>
            <NEmpty v-if="upcomingEvents.length === 0" description="近期暂无星象事件">
              <template #icon>
                <div class="empty-icon">🌙</div>
              </template>
            </NEmpty>

            <NList v-else class="events-list">
              <NListItem v-for="event in upcomingEvents" :key="event.id" class="event-item">
                <NCard class="glass-card event-card" bordered="false">
                  <div class="event-header">
                    <div class="event-icon">{{ event.icon }}</div>
                    <div class="event-info">
                      <div class="event-name">{{ event.name }}</div>
                      <div class="event-date">
                        {{ event.startDate }} 
                        <template v-if="event.startDate !== event.endDate"> ~ {{ event.endDate }}</template>
                      </div>
                    </div>
                    <NTag 
                      size="small" 
                      :type="getImpactTagType(event.impactLevel)"
                    >
                      {{ getImpactText(event.impactLevel) }}影响
                    </NTag>
                  </div>
                  <p class="event-description">{{ event.description }}</p>
                  <div class="event-advice">
                    <span class="advice-label">🌟 建议：</span>
                    <span class="advice-text">{{ event.advice }}</span>
                  </div>
                </NCard>
              </NListItem>
            </NList>
          </template>
        </NCard>

        <NCard v-if="activeEvents.length > 0" class="glass-card active-events-card" bordered="false">
          <div class="section-title">当前进行中</div>
          <div class="active-events-banner">
            <div v-for="event in activeEvents" :key="event.id" class="active-event-badge">
              <span class="badge-icon">{{ event.icon }}</span>
              <span class="badge-name">{{ event.name }}</span>
            </div>
          </div>
        </NCard>
      </template>

      <template v-else-if="activeTab === 'custom'">
        <div class="action-bar">
          <NButton type="primary" @click="safeOpenAddModal" class="add-btn">
            <template #icon>
              <NIcon :component="AddOutline" />
            </template>
            添加自定义提醒
          </NButton>
        </div>

        <NCard v-if="!hasReminders" class="glass-card empty-card" bordered="false">
          <NEmpty description="暂无自定义提醒，点击上方按钮添加">
            <template #icon>
              <div class="empty-icon">📝</div>
            </template>
          </NEmpty>
        </NCard>

        <NList v-else class="reminder-list">
          <NListItem 
            v-for="reminder in sortedReminders" 
            :key="reminder.id" 
            class="reminder-item"
          >
            <NCard class="glass-card reminder-card" bordered="false">
              <div class="reminder-header">
                <div class="reminder-icon">
                  {{ getSignSymbol(reminder.signId) }}
                </div>
                <div class="reminder-info">
                  <div class="reminder-title">{{ reminder.title }}</div>
                  <div class="reminder-meta">
                    <NTag size="small" type="info">
                      {{ getSignName(reminder.signId) }}
                    </NTag>
                    <NTag size="small" :type="reminder.enabled ? 'success' : 'default'">
                      {{ reminder.enabled ? '已启用' : '已禁用' }}
                    </NTag>
                  </div>
                </div>
                <NSwitch 
                  :value="reminder.enabled" 
                  @update:value="(val) => safeToggleReminder(reminder.id, val)"
                  class="reminder-switch"
                />
              </div>

              <div class="reminder-body">
                <div class="reminder-detail">
                  <span class="detail-icon">📅</span>
                  <span class="detail-text">{{ safeFormatDate(reminder.date) }}</span>
                </div>
                <div class="reminder-detail">
                  <span class="detail-icon">⏰</span>
                  <span class="detail-text">{{ reminder.time || '未设置' }}</span>
                </div>
                <div class="reminder-detail">
                  <span class="detail-icon">🔄</span>
                  <span class="detail-text">{{ getRepeatText(reminder.repeat) }}</span>
                </div>
                <div v-if="reminder.description" class="reminder-description">
                  {{ reminder.description }}
                </div>
              </div>

              <div class="reminder-actions">
                <NButton size="small" type="default" @click="safeOpenEditModal(reminder)">
                  <template #icon>
                    <NIcon :component="CreateOutline" />
                  </template>
                  编辑
                </NButton>
                <NButton size="small" type="error" @click="safeHandleDelete(reminder.id)">
                  <template #icon>
                    <NIcon :component="TrashOutline" />
                  </template>
                  删除
                </NButton>
              </div>
            </NCard>
          </NListItem>
        </NList>
      </template>

      <template v-else-if="activeTab === 'settings'">
        <NCard class="glass-card settings-card" bordered="false">
          <div class="settings-section">
            <div class="settings-section-header">
              <div class="section-title">智能提醒开关</div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">启用智能提醒</div>
                <div class="setting-desc">自动检测运势波动和星象事件，推送智能提醒</div>
              </div>
              <NSwitch 
                v-model:value="settingsForm.enabled"
                @update:value="saveSettings"
              />
            </div>
          </div>

          <NDivider />

          <div class="settings-section">
            <div class="settings-section-header">
              <div class="section-title">提醒类型</div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">运势预警</div>
                <div class="setting-desc">当运势出现明显波动时推送提醒</div>
              </div>
              <NSwitch 
                v-model:value="settingsForm.fortuneWarning"
                :disabled="!settingsForm.enabled"
                @update:value="saveSettings"
              />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">星象事件</div>
                <div class="setting-desc">水逆、满月、日月食、行星逆行等星象提醒</div>
              </div>
              <NSwitch 
                v-model:value="settingsForm.astronomicalEvents"
                :disabled="!settingsForm.enabled"
                @update:value="saveSettings"
              />
            </div>
          </div>

          <NDivider />

          <div class="settings-section">
            <div class="settings-section-header">
              <div class="section-title">提醒敏感度</div>
              <div class="settings-section-desc">控制触发提醒的灵敏度，敏感度越高越容易收到提醒</div>
            </div>
            <div class="sensitivity-options">
              <div 
                v-for="opt in sensitivityOptions" 
                :key="opt.value"
                :class="['sensitivity-option', { active: settingsForm.sensitivity === opt.value }]"
                @click="setSensitivity(opt.value)"
              >
                <div class="sensitivity-emoji">{{ opt.emoji }}</div>
                <div class="sensitivity-name">{{ opt.label }}</div>
                <div class="sensitivity-threshold">波动阈值 {{ opt.threshold }}分</div>
              </div>
            </div>
          </div>

          <NDivider />

          <div class="settings-section">
            <div class="settings-section-header">
              <div class="section-title">省电省流设置</div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">仅WiFi下推送</div>
                <div class="setting-desc">在移动数据网络下不推送提醒，节省流量</div>
              </div>
              <NSwitch 
                v-model:value="settingsForm.wifiOnly"
                :disabled="!settingsForm.enabled"
                @update:value="saveSettings"
              />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">每日推送时间</div>
                <div class="setting-desc">设置每日自动检测和推送提醒的时间</div>
              </div>
              <NTimePicker 
                v-model:value="settingsForm.pushTime" 
                value-format="HH:mm"
                :disabled="!settingsForm.enabled"
                @update:value="saveSettings"
                class="time-picker"
              />
            </div>
          </div>

          <NDivider />

          <div class="settings-section">
            <div class="settings-section-header">
              <div class="section-title">免打扰设置</div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-name">启用免打扰时段</div>
                <div class="setting-desc">在设置时段内不推送任何提醒</div>
              </div>
              <NSwitch 
                v-model:value="settingsForm.dndEnabled"
                :disabled="!settingsForm.enabled"
                @update:value="saveSettings"
              />
            </div>
            <div class="time-range-row" v-if="settingsForm.dndEnabled">
              <div class="time-range-item">
                <div class="time-label">开始时间</div>
                <NTimePicker 
                  v-model:value="settingsForm.dndStart" 
                  value-format="HH:mm"
                  :disabled="!settingsForm.dndEnabled || !settingsForm.enabled"
                  @update:value="saveSettings"
                />
              </div>
              <div class="time-range-divider">至</div>
              <div class="time-range-item">
                <div class="time-label">结束时间</div>
                <NTimePicker 
                  v-model:value="settingsForm.dndEnd" 
                  value-format="HH:mm"
                  :disabled="!settingsForm.dndEnabled || !settingsForm.enabled"
                  @update:value="saveSettings"
                />
              </div>
            </div>
          </div>

          <NDivider />

          <div class="settings-actions">
            <NButton @click="resetSettings">恢复默认设置</NButton>
          </div>
        </NCard>
      </template>
    </div>

    <NModal 
      v-model:show="showModal" 
      preset="card" 
      :title="editingReminder ? '编辑自定义提醒' : '添加自定义提醒'"
      class="reminder-modal"
      :mask-closable="false"
    >
      <NForm 
        ref="formRef" 
        :model="formData" 
        :rules="rules" 
        label-placement="top"
        :show-label="true"
      >
        <NFormItem label="提醒标题" path="title">
          <NInput 
            v-model:value="formData.title" 
            placeholder="请输入提醒标题"
            clearable
          />
        </NFormItem>

        <NFormItem label="关联星座" path="signId">
          <NSelect 
            v-model:value="formData.signId" 
            :options="signOptions" 
            placeholder="请选择星座"
            clearable
          >
            <template #option="{ option }">
              <span class="select-option">
                <span class="option-symbol">{{ option.symbol }}</span>
                <span class="option-name">{{ option.name }}</span>
              </span>
            </template>
          </NSelect>
        </NFormItem>

        <div class="form-row">
          <NFormItem label="提醒日期" path="date" class="form-item-half">
            <NDatePicker 
              v-model:value="formData.date" 
              type="date" 
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              clearable
            />
          </NFormItem>

          <NFormItem label="提醒时间" path="time" class="form-item-half">
            <NTimePicker 
              v-model:value="formData.time" 
              placeholder="选择时间"
              value-format="HH:mm"
              style="width: 100%"
              clearable
            />
          </NFormItem>
        </div>

        <NFormItem label="重复频率" path="repeat">
          <NSelect 
            v-model:value="formData.repeat" 
            :options="repeatOptions" 
            placeholder="请选择重复频率"
          />
        </NFormItem>

        <NFormItem label="描述" path="description">
          <NInput 
            v-model:value="formData.description" 
            type="textarea" 
            placeholder="请输入提醒描述（可选）"
            :rows="3"
          />
        </NFormItem>

        <NFormItem label="启用提醒">
          <NSwitch v-model:value="formData.enabled" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NButton @click="safeCloseModal">取消</NButton>
        <NButton type="primary" @click="safeHandleSubmit">确认</NButton>
      </template>
    </NModal>

    <NModal v-model:show="showDeleteConfirm" preset="dialog" title="确认删除">
      <p>确定要删除这个提醒吗？此操作无法撤销。</p>
      <template #footer>
        <NButton @click="showDeleteConfirm = false">取消</NButton>
        <NButton type="error" @click="safeConfirmDelete">删除</NButton>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import type { FormRules, FormInst } from 'naive-ui'
import { 
  NCard, NButton, NIcon, NTag, NList, NListItem, NModal, 
  NForm, NFormItem, NInput, NSelect, NDatePicker, NTimePicker, 
  NSwitch, NEmpty, NTabs, NTabPane, NBadge, NSpin, NDivider
} from 'naive-ui'
import { 
  AddOutline, CreateOutline, TrashOutline, RefreshOutline 
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import { 
  generateSmartReminder, 
  getUpcomingAstronomicalEvents, 
  getActiveAstronomicalEvents 
} from '@/data/mockApi'
import type { 
  CustomReminder, 
  SmartReminder, 
  AstronomicalEvent,
  ReminderSensitivity,
  SmartReminderSettings
} from '@/types'
import { format } from 'date-fns'

const userStore = useUserStore()
const message = useMessage()

const activeTab = ref<'smart' | 'events' | 'custom' | 'settings'>('smart')
const generating = ref(false)
const eventsLoading = ref(false)
const upcomingEvents = ref<AstronomicalEvent[]>([])
const activeEvents = ref<AstronomicalEvent[]>([])

const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingReminder = ref<CustomReminder | null>(null)
const deletingId = ref<string | null>(null)

const formData = reactive({
  title: '',
  signId: '',
  date: '',
  time: '',
  repeat: 'none' as CustomReminder['repeat'],
  description: '',
  enabled: true
})

const settingsForm = reactive<SmartReminderSettings>({
  ...userStore.smartReminderSettings
})

watch(
  () => userStore.smartReminderSettings,
  (newVal) => {
    Object.assign(settingsForm, newVal)
  },
  { deep: true }
)

const sensitivityOptions = [
  { value: 'high' as ReminderSensitivity, label: '高敏感度', emoji: '🔴', threshold: 5, desc: '波动5分以上即提醒' },
  { value: 'medium' as ReminderSensitivity, label: '中敏感度', emoji: '🟡', threshold: 10, desc: '波动10分以上即提醒' },
  { value: 'low' as ReminderSensitivity, label: '低敏感度', emoji: '🟢', threshold: 15, desc: '波动15分以上即提醒' }
]

const rules: FormRules = {
  title: { required: true, message: '请输入提醒标题', trigger: 'blur' },
  signId: { required: true, message: '请选择关联星座', trigger: 'change' },
  date: { required: true, message: '请选择提醒日期', trigger: 'change' },
  time: { required: true, message: '请选择提醒时间', trigger: 'change' },
  repeat: { required: true, message: '请选择重复频率', trigger: 'change' }
}

const signOptions = computed(() => 
  zodiacSigns.map(sign => ({
    id: sign.id,
    name: `${sign.symbol} ${sign.name}`,
    symbol: sign.symbol,
    label: `${sign.symbol} ${sign.name}`,
    value: sign.id
  }))
)

const repeatOptions = [
  { label: '不重复', value: 'none' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' }
]

const hasReminders = computed(() => {
  try {
    return userStore.reminders && userStore.reminders.length > 0
  } catch {
    return false
  }
})

const sortedReminders = computed(() => {
  try {
    if (!userStore.reminders || !Array.isArray(userStore.reminders)) {
      return []
    }
    return [...userStore.reminders].sort((a, b) => {
      if (!a || !b) return 0
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1
      try {
        const timeA = new Date(`${a.date}T${a.time}`).getTime()
        const timeB = new Date(`${b.date}T${b.time}`).getTime()
        return timeB - timeA
      } catch {
        return 0
      }
    })
  } catch {
    return []
  }
})

const fortuneWarningCount = computed(() => 
  userStore.smartReminders.filter(r => r.type === 'fortune_warning').length
)

const astronomicalCount = computed(() => 
  userStore.smartReminders.filter(r => r.type === 'astronomical_event').length
)

const getStarStyle = (index: number) => {
  try {
    const left = Math.random() * 100
    const top = Math.random() * 100
    const size = Math.random() * 3 + 1
    const delay = Math.random() * 3
    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`
    }
  } catch {
    return {}
  }
}

const getSignSymbol = (signId: string) => {
  try {
    const sign = getSignById(signId)
    return sign?.symbol || '✨'
  } catch {
    return '✨'
  }
}

const getSignName = (signId: string) => {
  try {
    const sign = getSignById(signId)
    return sign?.name || '未知'
  } catch {
    return '未知'
  }
}

const safeFormatDate = (dateStr: string) => {
  try {
    if (!dateStr) return '未设置'
    return format(new Date(dateStr), 'yyyy年MM月dd日')
  } catch {
    return dateStr || '未设置'
  }
}

const getRepeatText = (repeat: CustomReminder['repeat']) => {
  try {
    const map: Record<string, string> = {
      none: '不重复',
      daily: '每日重复',
      weekly: '每周重复',
      monthly: '每月重复'
    }
    return map[repeat] || repeat
  } catch {
    return '不重复'
  }
}

const formatTime = (isoString: string) => {
  try {
    return format(new Date(isoString), 'MM-dd HH:mm')
  } catch {
    return isoString
  }
}

const getDirectionText = (direction: string) => {
  const map: Record<string, string> = {
    up: '📈 上升',
    down: '📉 下降',
    neutral: '➖ 平稳'
  }
  return map[direction] || direction
}

const getDirectionTagType = (direction: string) => {
  const map: Record<string, any> = {
    up: 'success',
    down: 'warning',
    neutral: 'default'
  }
  return map[direction] || 'default'
}

const getSensitivityText = (sensitivity: ReminderSensitivity) => {
  const map: Record<ReminderSensitivity, string> = {
    high: '高敏感',
    medium: '中敏感',
    low: '低敏感'
  }
  return map[sensitivity] || sensitivity
}

const getImpactTagType = (level: string) => {
  const map: Record<string, any> = {
    high: 'error',
    medium: 'warning',
    low: 'info'
  }
  return map[level] || 'default'
}

const getImpactText = (level: string) => {
  const map: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[level] || level
}

const resetForm = () => {
  try {
    formData.title = ''
    formData.signId = ''
    formData.date = ''
    formData.time = ''
    formData.repeat = 'none'
    formData.description = ''
    formData.enabled = true
  } catch (e) {
    console.error('Error resetting form:', e)
  }
}

const safeOpenAddModal = () => {
  try {
    editingReminder.value = null
    resetForm()
    showModal.value = true
  } catch (e) {
    console.error('Error opening add modal:', e)
    message.error('打开添加提醒失败，请重试')
  }
}

const safeOpenEditModal = (reminder: CustomReminder) => {
  try {
    if (!reminder) return
    editingReminder.value = reminder
    formData.title = reminder.title || ''
    formData.signId = reminder.signId || ''
    formData.date = reminder.date || ''
    formData.time = reminder.time || ''
    formData.repeat = reminder.repeat || 'none'
    formData.description = reminder.description || ''
    formData.enabled = reminder.enabled ?? true
    showModal.value = true
  } catch (e) {
    console.error('Error opening edit modal:', e)
    message.error('打开编辑提醒失败，请重试')
  }
}

const safeCloseModal = () => {
  try {
    showModal.value = false
    setTimeout(() => resetForm(), 300)
  } catch (e) {
    console.error('Error closing modal:', e)
    showModal.value = false
  }
}

const safeHandleSubmit = () => {
  try {
    if (!formRef.value) {
      message.error('表单未正确初始化，请刷新页面重试')
      return
    }
    
    formRef.value.validate((errors) => {
      try {
        if (!errors) {
          if (editingReminder.value && editingReminder.value.id) {
            userStore.updateReminder(editingReminder.value.id, {
              title: formData.title,
              signId: formData.signId,
              date: formData.date,
              time: formData.time,
              repeat: formData.repeat,
              description: formData.description,
              enabled: formData.enabled
            })
            message.success('提醒已更新')
          } else {
            userStore.addReminder({
              title: formData.title,
              signId: formData.signId,
              date: formData.date,
              time: formData.time,
              repeat: formData.repeat,
              description: formData.description,
              enabled: formData.enabled
            })
            message.success('提醒已添加')
          }
          showModal.value = false
          resetForm()
        } else {
          message.warning('请填写完整的表单信息')
        }
      } catch (e) {
        console.error('Error in form validation callback:', e)
        message.error('保存提醒失败，请重试')
      }
    })
  } catch (e) {
    console.error('Error handling submit:', e)
    message.error('保存提醒失败，请重试')
  }
}

const safeToggleReminder = (id: string, enabled: boolean) => {
  try {
    if (!id) return
    userStore.updateReminder(id, { enabled })
    message.success(enabled ? '提醒已启用' : '提醒已禁用')
  } catch (e) {
    console.error('Error toggling reminder:', e)
    message.error('操作失败，请重试')
  }
}

const safeHandleDelete = (id: string) => {
  try {
    if (!id) return
    deletingId.value = id
    showDeleteConfirm.value = true
  } catch (e) {
    console.error('Error handling delete:', e)
    message.error('操作失败，请重试')
  }
}

const safeConfirmDelete = () => {
  try {
    if (deletingId.value) {
      userStore.deleteReminder(deletingId.value)
      message.success('提醒已删除')
    }
    showDeleteConfirm.value = false
    deletingId.value = null
  } catch (e) {
    console.error('Error confirming delete:', e)
    message.error('删除失败，请重试')
    showDeleteConfirm.value = false
    deletingId.value = null
  }
}

const handleGenerateReminder = async () => {
  generating.value = true
  try {
    const reminder = await generateSmartReminder(
      userStore.defaultSign,
      settingsForm.sensitivity
    )
    if (reminder) {
      userStore.addSmartReminder(reminder)
      userStore.setLastSmartReminderDate(format(new Date(), 'yyyy-MM-dd'))
      message.success('智能提醒已生成')
    } else {
      message.info('今日运势平稳，暂无需要提醒的变化')
    }
  } catch (e) {
    console.error('Error generating reminder:', e)
    message.error('生成提醒失败，请重试')
  } finally {
    generating.value = false
  }
}

const handleReminderClick = (reminder: SmartReminder) => {
  if (!reminder.read) {
    userStore.markSmartReminderAsRead(reminder.id)
  }
}

const handleMarkAllRead = () => {
  userStore.markAllSmartRemindersAsRead()
  message.success('已全部标记为已读')
}

const handleClearAll = () => {
  userStore.clearSmartReminders()
  message.success('已清空所有智能提醒记录')
}

const handleDeleteSmartReminder = (id: string) => {
  userStore.deleteSmartReminder(id)
  message.success('提醒已删除')
}

const setSensitivity = (value: ReminderSensitivity) => {
  settingsForm.sensitivity = value
  saveSettings()
}

const saveSettings = () => {
  userStore.updateSmartReminderSettings({ ...settingsForm })
}

const resetSettings = () => {
  userStore.resetSmartReminderSettings()
  message.success('已恢复默认设置')
}

const loadEvents = async () => {
  eventsLoading.value = true
  try {
    const [upcoming, active] = await Promise.all([
      getUpcomingAstronomicalEvents(30),
      getActiveAstronomicalEvents(new Date())
    ])
    upcomingEvents.value = upcoming
    activeEvents.value = active
  } catch (e) {
    console.error('Error loading events:', e)
    message.error('加载星象事件失败')
  } finally {
    eventsLoading.value = false
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.reminder-view {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
}

.stars-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--star-white);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--pale-lavender);
  margin-bottom: 24px;
}

.main-tabs {
  margin-bottom: 24px;
}

.smart-reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.smart-stats {
  display: flex;
  gap: 20px;
}

.smart-stat {
  text-align: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--neon-purple);
}

.stat-label {
  font-size: 12px;
  color: var(--pale-lavender);
  margin-top: 4px;
}

.smart-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 40px 20px !important;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.smart-reminder-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

.smart-reminder-item {
  padding: 0 !important;
  cursor: pointer;
}

.smart-reminder-card {
  transition: all 0.3s ease;
  border-left: 3px solid transparent !important;
}

.smart-reminder-item.unread .smart-reminder-card {
  border-left-color: var(--neon-purple) !important;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(255, 255, 255, 0.02)) !important;
}

.smart-reminder-header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.reminder-type-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.reminder-type-icon.fortune_warning {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(249, 115, 22, 0.1));
}

.reminder-type-icon.astronomical_event {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(0, 212, 255, 0.1));
}

.smart-reminder-main {
  flex: 1;
  min-width: 0;
}

.smart-reminder-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.smart-reminder-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.smart-reminder-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.reminder-time {
  font-size: 12px;
  color: var(--pale-lavender);
}

.smart-reminder-content {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  margin-bottom: 16px;
}

.reminder-content-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  margin: 0 0 12px 0;
}

.affected-areas {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.affected-label {
  font-size: 13px;
  color: var(--pale-lavender);
}

.area-tag {
  background: rgba(168, 85, 247, 0.15) !important;
  border: 1px solid rgba(168, 85, 247, 0.3) !important;
}

.score-change-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.score-label {
  color: var(--pale-lavender);
}

.score-divider {
  color: var(--pale-lavender);
}

.score-change {
  font-weight: 700;
  margin-left: 8px;
  font-size: 15px;
}

.score-change.positive {
  color: #10b981;
}

.score-change.negative {
  color: #f97316;
}

.reminder-advice {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(0, 212, 255, 0.04));
  border-radius: 8px;
  border-left: 3px solid var(--neon-purple);
}

.advice-label {
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.advice-text {
  font-size: 13px;
  color: var(--star-white);
  line-height: 1.6;
}

.smart-reminder-footer {
  display: flex;
  justify-content: flex-end;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.events-card,
.active-events-card,
.settings-card {
  margin-bottom: 20px;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

.event-item {
  padding: 0 !important;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.event-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(0, 212, 255, 0.1));
  flex-shrink: 0;
}

.event-info {
  flex: 1;
  min-width: 0;
}

.event-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.event-date {
  font-size: 13px;
  color: var(--pale-lavender);
}

.event-description {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.7;
  margin: 0 0 12px 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.event-advice {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(249, 115, 22, 0.04));
  border-radius: 8px;
  border-left: 3px solid #ffd700;
}

.active-events-banner {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.active-event-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(0, 212, 255, 0.1));
  border: 1px solid var(--neon-purple);
  border-radius: 24px;
}

.badge-icon {
  font-size: 20px;
}

.badge-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--star-white);
}

.settings-section {
  margin-bottom: 8px;
}

.settings-section-header {
  margin-bottom: 16px;
}

.settings-section-desc {
  font-size: 13px;
  color: var(--pale-lavender);
  margin-top: 4px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  gap: 16px;
}

.setting-info {
  flex: 1;
  min-width: 0;
}

.setting-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 13px;
  color: var(--pale-lavender);
  line-height: 1.5;
}

.time-picker {
  width: 140px;
}

.time-range-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0 0 0;
}

.time-range-item {
  flex: 1;
}

.time-label {
  font-size: 13px;
  color: var(--pale-lavender);
  margin-bottom: 8px;
}

.time-range-divider {
  font-size: 14px;
  color: var(--pale-lavender);
  padding-top: 28px;
}

.sensitivity-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.sensitivity-option {
  padding: 20px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sensitivity-option:hover {
  background: rgba(255, 255, 255, 0.06);
}

.sensitivity-option.active {
  border-color: var(--neon-purple);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(0, 212, 255, 0.05));
}

.sensitivity-emoji {
  font-size: 32px;
  margin-bottom: 8px;
}

.sensitivity-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.sensitivity-threshold {
  font-size: 12px;
  color: var(--pale-lavender);
}

.settings-actions {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.add-btn {
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-blue)) !important;
  border: none !important;
}

.empty-card {
  text-align: center;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

.reminder-item {
  padding: 0 !important;
}

.reminder-card {
  transition: all 0.3s ease;
}

.reminder-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.reminder-icon {
  font-size: 40px;
  line-height: 1;
  filter: drop-shadow(0 0 10px rgba(179, 102, 255, 0.5));
}

.reminder-info {
  flex: 1;
  min-width: 0;
}

.reminder-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reminder-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.reminder-switch {
  flex-shrink: 0;
}

.reminder-body {
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.reminder-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-icon {
  font-size: 16px;
}

.detail-text {
  flex: 1;
}

.reminder-description {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  font-weight: 500;
}

.reminder-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-item-half {
  flex: 1;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-symbol {
  font-size: 18px;
}

.option-name {
  font-size: 14px;
  color: var(--text-primary);
}

.reminder-modal :deep(.n-modal-card) {
  background: var(--midnight-blue) !important;
  border: 1px solid var(--glass-border);
}

.reminder-modal :deep(.n-modal-card-title) {
  color: var(--text-primary) !important;
  font-weight: 600;
}

.reminder-modal :deep(.n-form-item-label) {
  color: var(--text-secondary) !important;
  font-weight: 500;
}

:deep(.n-select-option) {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  color: var(--text-primary) !important;
}

@media (max-width: 768px) {
  .reminder-view {
    padding: 12px;
  }

  .page-title {
    font-size: 22px;
  }

  .smart-reminder-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .smart-stats {
    width: 100%;
    justify-content: space-between;
  }

  .smart-stat {
    flex: 1;
    padding: 10px 8px;
  }

  .stat-num {
    font-size: 20px;
  }

  .sensitivity-options {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .reminder-header {
    flex-wrap: wrap;
  }

  .reminder-info {
    min-width: 0;
    flex: 1;
  }

  .reminder-title {
    font-size: 16px;
  }

  .reminder-icon {
    font-size: 32px;
  }

  .reminder-actions {
    flex-wrap: wrap;
  }

  .reminder-actions .n-button {
    flex: 1;
  }

  .time-range-row {
    flex-direction: column;
    align-items: stretch;
  }

  .time-range-divider {
    padding-top: 0;
    text-align: center;
  }

  .smart-reminder-header-row {
    flex-wrap: wrap;
  }

  .event-header {
    flex-wrap: wrap;
  }

  .setting-item {
    flex-wrap: wrap;
  }
}
</style>
