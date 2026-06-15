<template>
  <div class="reminder-view">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <h1 class="page-title">星座提醒</h1>
      <p class="page-subtitle">设置重要日子的自定义提醒</p>

      <div class="action-bar">
        <NButton type="primary" @click="openAddModal" class="add-btn">
          <template #icon>
            <NIcon :component="AddOutline" />
          </template>
          添加提醒
        </NButton>
      </div>

      <NCard v-if="userStore.reminders.length === 0" class="glass-card empty-card" bordered="false">
        <NEmpty description="暂无提醒，点击上方按钮添加">
          <template #icon>
            <div class="empty-icon">🔔</div>
          </template>
        </NEmpty>
      </NCard>

      <NList v-else class="reminder-list">
        <NListItem v-for="reminder in sortedReminders" :key="reminder.id" class="reminder-item">
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
                @update:value="(val) => toggleReminder(reminder.id, val)"
                class="reminder-switch"
              />
            </div>

            <div class="reminder-body">
              <div class="reminder-detail">
                <span class="detail-icon">📅</span>
                <span class="detail-text">{{ formatDate(reminder.date) }}</span>
              </div>
              <div class="reminder-detail">
                <span class="detail-icon">⏰</span>
                <span class="detail-text">{{ reminder.time }}</span>
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
              <NButton size="small" type="default" @click="openEditModal(reminder)">
                <template #icon>
                  <NIcon :component="CreateOutline" />
                </template>
                编辑
              </NButton>
              <NButton size="small" type="error" @click="handleDelete(reminder.id)">
                <template #icon>
                  <NIcon :component="TrashOutline" />
                </template>
                删除
              </NButton>
            </div>
          </NCard>
        </NListItem>
      </NList>
    </div>

    <NModal 
      v-model:show="showModal" 
      preset="card" 
      :title="editingReminder ? '编辑提醒' : '添加提醒'"
      class="reminder-modal"
      :mask-closable="false"
    >
      <NForm ref="formRef" :model="formData" :rules="rules" label-placement="top">
        <NFormItem label="提醒标题" path="title">
          <NInput v-model:value="formData.title" placeholder="请输入提醒标题" />
        </NFormItem>

        <NFormItem label="关联星座" path="signId">
          <NSelect 
            v-model:value="formData.signId" 
            :options="signOptions" 
            placeholder="请选择星座"
            label-field="name"
            value-field="id"
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
            />
          </NFormItem>

          <NFormItem label="提醒时间" path="time" class="form-item-half">
            <NTimePicker 
              v-model:value="formData.time" 
              placeholder="选择时间"
              value-format="HH:mm"
              style="width: 100%"
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
        <NButton @click="showModal = false">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确认</NButton>
      </template>
    </NModal>

    <NModal v-model:show="showDeleteConfirm" preset="dialog" title="确认删除">
      <p>确定要删除这个提醒吗？此操作无法撤销。</p>
      <template #footer>
        <NButton @click="showDeleteConfirm = false">取消</NButton>
        <NButton type="error" @click="confirmDelete">删除</NButton>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useMessage } from 'naive-ui'
import type { FormInst } from 'naive-ui/es/form/src/interface'
import { 
  NCard, NButton, NIcon, NTag, NList, NListItem, NModal, 
  NForm, NFormItem, NInput, NSelect, NDatePicker, NTimePicker, 
  NSwitch, NEmpty 
} from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import type { CustomReminder } from '@/types'
import { format } from 'date-fns'

const userStore = useUserStore()
const message = useMessage()
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

const rules = {
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

const sortedReminders = computed(() => 
  [...userStore.reminders].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1
    return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
  })
)

const getStarStyle = (index: number) => {
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
}

const getSignSymbol = (signId: string) => {
  const sign = getSignById(signId)
  return sign?.symbol || '✨'
}

const getSignName = (signId: string) => {
  const sign = getSignById(signId)
  return sign?.name || '未知'
}

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'yyyy年MM月dd日')
  } catch {
    return dateStr
  }
}

const getRepeatText = (repeat: CustomReminder['repeat']) => {
  const map: Record<string, string> = {
    none: '不重复',
    daily: '每日重复',
    weekly: '每周重复',
    monthly: '每月重复'
  }
  return map[repeat] || repeat
}

const openAddModal = () => {
  editingReminder.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (reminder: CustomReminder) => {
  editingReminder.value = reminder
  formData.title = reminder.title
  formData.signId = reminder.signId
  formData.date = reminder.date
  formData.time = reminder.time
  formData.repeat = reminder.repeat
  formData.description = reminder.description
  formData.enabled = reminder.enabled
  showModal.value = true
}

const resetForm = () => {
  formData.title = ''
  formData.signId = ''
  formData.date = ''
  formData.time = ''
  formData.repeat = 'none'
  formData.description = ''
  formData.enabled = true
}

const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (editingReminder.value) {
        userStore.updateReminder(editingReminder.value.id, { ...formData })
        message.success('提醒已更新')
      } else {
        userStore.addReminder({ ...formData })
        message.success('提醒已添加')
      }
      showModal.value = false
      resetForm()
    }
  })
}

const toggleReminder = (id: string, enabled: boolean) => {
  userStore.updateReminder(id, { enabled })
  message.success(enabled ? '提醒已启用' : '提醒已禁用')
}

const handleDelete = (id: string) => {
  deletingId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (deletingId.value) {
    userStore.deleteReminder(deletingId.value)
    message.success('提醒已删除')
  }
  showDeleteConfirm.value = false
  deletingId.value = null
}
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
  max-width: 800px;
  margin: 0 auto;
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

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
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
  filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
}

.reminder-info {
  flex: 1;
  min-width: 0;
}

.reminder-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--star-white);
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
  color: var(--pale-lavender);
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
  color: var(--pale-lavender);
  line-height: 1.6;
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
}

.reminder-modal :deep(.n-modal-card) {
  background: var(--midnight-blue) !important;
  border: 1px solid var(--glass-border);
}

.reminder-modal :deep(.n-modal-card-title) {
  color: var(--star-white) !important;
}

.reminder-modal :deep(.n-form-item-label) {
  color: var(--pale-lavender) !important;
}

:deep(.n-select-option) {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

@media (max-width: 768px) {
  .reminder-view {
    padding: 12px;
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
}
</style>
