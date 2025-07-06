<template>
  <div class="container">
    <aside class="sidebar">
      <h2>Параметры</h2>

      <div class="control-group">
        <label>Скорость симуляции: {{ simulationSpeed.toFixed(1) }}</label>
        <input type="range" min="0.5" max="5" step="0.1" v-model.number="simulationSpeed" />
      </div>

      <div class="control-group">
        <label>Количество зон травы: {{ initialGrassZoneCount }}</label>
        <input type="range" min="1" max="10" step="1" v-model.number="initialGrassZoneCount" />
      </div>
      <div class="control-group">
        <label>Скорость восстановления травы: {{ grassRegenerationRate.toFixed(3) }}</label>
        <input type="range" min="0" max="0.1" step="0.001" v-model.number="grassRegenerationRate" />
      </div>
      <div class="control-group">
        <label>Количество зон укрытий: {{ initialShelterZoneCount }}</label>
        <input type="range" min="0" max="10" step="1" v-model.number="initialShelterZoneCount" />
      </div>

      <h3>Жертвы</h3>
      <div class="control-group">
        <label>Начальное количество: {{ initialPreyCount }}</label>
        <input type="range" min="5" max="100" step="1" v-model.number="initialPreyCount" />
      </div>
      <div class="control-group">
        <label>Скорость: {{ preySpeed.toFixed(1) }}</label>
        <input type="range" min="0.1" max="5" step="0.1" v-model.number="preySpeed" />
      </div>
      <div class="control-group">
        <label>Угол обзора: {{ preyFov }}</label>
        <input type="range" min="10" max="360" step="5" v-model.number="preyFov" />
      </div>
      <div class="control-group">
        <label>Дальность обзора: {{ preyViewDistance }}</label>
        <input type="range" min="20" max="300" step="10" v-model.number="preyViewDistance" />
      </div>
      <div class="control-group">
        <label>Трата энергии при движении: {{ preyEnergyConsumption.toFixed(3) }}</label>
        <input
          type="range"
          min="0"
          max="0.05"
          step="0.001"
          v-model.number="preyEnergyConsumption"
        />
      </div>
      <div class="control-group">
        <label>Время в укрытии: {{ preyHidingSafeTimeThreshold }}</label>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          v-model.number="preyHidingSafeTimeThreshold"
        />
      </div>
      <div class="control-group">
        <label>Время до размножения: {{ preyReproductionCooldown }}</label>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          v-model.number="preyReproductionCooldown"
        />
      </div>

      <h3>Хищники</h3>
      <div class="control-group">
        <label>Начальное количество: {{ initialHunterCount }}</label>
        <input type="range" min="1" max="50" step="1" v-model.number="initialHunterCount" />
      </div>
      <div class="control-group">
        <label>Скорость: {{ hunterSpeed.toFixed(1) }}</label>
        <input type="range" min="0.1" max="5" step="0.1" v-model.number="hunterSpeed" />
      </div>
      <div class="control-group">
        <label>Угол обзора: {{ hunterFov }}</label>
        <input type="range" min="10" max="360" step="5" v-model.number="hunterFov" />
      </div>
      <div class="control-group">
        <label>Дальность обзора: {{ hunterViewDistance }}</label>
        <input type="range" min="20" max="300" step="10" v-model.number="hunterViewDistance" />
      </div>
      <div class="control-group">
        <label>Трата энергии при движении: {{ hunterEnergyConsumption.toFixed(3) }}</label>
        <input
          type="range"
          min="0"
          max="0.05"
          step="0.001"
          v-model.number="hunterEnergyConsumption"
        />
      </div>
      <div class="control-group">
        <label>Время до размножения: {{ hunterReproductionCooldown }}</label>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          v-model.number="hunterReproductionCooldown"
        />
      </div>

      <button @click="toggleSimulation">{{ isRunning ? 'Пауза' : 'Старт' }}</button>
      <button @click="resetSimulation">Сбросить</button>
    </aside>

    <main class="main-content">
      <canvas ref="canvas" :width="width" :height="height" />
    </main>

    <aside class="info-panel">
      <div class="current-counts" style="margin-top: 16px">
        <h3>Текущее состояние</h3>
        <p>Жертвы: {{ currentPreyCount }}</p>
        <p>Хищники: {{ currentHunterCount }}</p>
      </div>

      <div v-if="selectedEntity">
        <h3>Выбранный объект</h3>
        <p>Тип: {{ selectedEntity.type }}</p>
        <p>Энергия: {{ selectedEntity.energy?.toFixed(2) }}</p>
        <p>Скорость: {{ selectedEntity.speed }}</p>
        <p>Угол обзора: {{ ((selectedEntity.fov * 180) / Math.PI).toFixed(0) }}°</p>
        <p>Дальность обзора: {{ selectedEntity.viewDistance }}</p>
        <p>Время до размножения: {{ selectedEntity.reproductionCooldown.toFixed(0) }}</p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Environment from '@/models/Environment'

const width = 1200
const height = 1000
const canvas = ref(null)
const environment = ref(null)

const simulationSpeed = ref(1.0)

const preySpeed = ref(0.4)
const preyFov = ref(120)
const preyViewDistance = ref(150)
const initialPreyCount = ref(30)
const preyEnergyConsumption = ref(0.01)
const preyReproductionCooldown = ref(500)
const preyHidingSafeTimeThreshold = ref(100)

const hunterSpeed = ref(0.3)
const hunterFov = ref(90)
const hunterViewDistance = ref(150)
const initialHunterCount = ref(3)
const hunterEnergyConsumption = ref(0.02)
const hunterReproductionCooldown = ref(800)

const initialGrassZoneCount = ref(3)
const grassRegenerationRate = ref(0.02)

const initialShelterZoneCount = ref(2)

const currentPreyCount = ref(0)
const currentHunterCount = ref(0)

const selectedEntity = ref(null)

const isRunning = ref(true)

function createEnvironment() {
  const env = new Environment(
    width,
    height,
    initialPreyCount.value,
    initialHunterCount.value,
    initialGrassZoneCount.value,
    grassRegenerationRate.value,
    initialShelterZoneCount.value,
  )
  env.preys.forEach((prey) => {
    prey.speed = preySpeed.value
    prey.fov = (preyFov.value * Math.PI) / 180
    prey.viewDistance = preyViewDistance.value
    prey.energyConsumption = preyEnergyConsumption.value
    prey.reproductionCooldown = preyReproductionCooldown.value
    prey.reproductionCooldownTime = preyReproductionCooldown.value
    prey.hidingSafeTimeThreshold = preyHidingSafeTimeThreshold.value
  })
  env.hunters.forEach((hunter) => {
    hunter.speed = hunterSpeed.value
    hunter.fov = (hunterFov.value * Math.PI) / 180
    hunter.viewDistance = hunterViewDistance.value
    hunter.energyConsumption = hunterEnergyConsumption.value
    hunter.reproductionCooldown = hunterReproductionCooldown.value
    hunter.reproductionCooldownTime = hunterReproductionCooldown.value
  })
  return env
}

watch(
  [
    preySpeed,
    preyFov,
    preyViewDistance,
    preyEnergyConsumption,
    preyReproductionCooldown,
    preyHidingSafeTimeThreshold,
  ],
  () => {
    if (!environment.value) return
    environment.value.preys.forEach((prey) => {
      prey.speed = preySpeed.value
      prey.fov = (preyFov.value * Math.PI) / 180
      prey.viewDistance = preyViewDistance.value
      prey.energyConsumption = preyEnergyConsumption.value
      prey.reproductionCooldown = preyReproductionCooldown.value
      prey.hidingSafeTimeThreshold = preyHidingSafeTimeThreshold.value
    })
  },
)

watch(
  [hunterSpeed, hunterFov, hunterViewDistance, hunterEnergyConsumption, hunterReproductionCooldown],
  () => {
    if (!environment.value) return
    environment.value.hunters.forEach((hunter) => {
      hunter.speed = hunterSpeed.value
      hunter.fov = (hunterFov.value * Math.PI) / 180
      hunter.viewDistance = hunterViewDistance.value
      hunter.energyConsumption = hunterEnergyConsumption.value
      hunter.reproductionCooldown = hunterReproductionCooldown.value
    })
  },
)

watch(
  [
    initialPreyCount,
    initialHunterCount,
    initialGrassZoneCount,
    grassRegenerationRate,
    initialShelterZoneCount,
  ],
  () => {
    resetSimulation()
  },
)

function toggleSimulation() {
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    animate()
  }
}

function resetSimulation() {
  environment.value = createEnvironment()
  updateCurrentCounts()
  isRunning.value = false
}

function drawEnvironment(ctx, env) {
  ctx.clearRect(0, 0, env.width, env.height)

  // рисуем зоны травы
  if (env.grassZones) {
    for (const zone of env.grassZones) {
      for (const food of zone.foodItems) {
        ctx.fillStyle = 'lime'
        ctx.beginPath()
        ctx.arc(food.x, food.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  if (env.shelterZones) {
    for (const zone of env.shelterZones) {
      ctx.fillStyle = 'rgba(100, 100, 255, 0.2)'
      ctx.beginPath()
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(100, 100, 255, 0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  for (const prey of env.preys) {
    drawEntity(ctx, prey, 'deepskyblue')
  }

  for (const hunter of env.hunters) {
    drawEntity(ctx, hunter, 'crimson')
  }
}

function drawEntity(ctx, entity, color) {
  const radius = 6
  const viewRadius = entity.viewDistance || 150
  const fov = entity.fov || Math.PI / 2

  // Полупрозрачный яркий сектор обзора с обводкой
  ctx.fillStyle = color
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.moveTo(entity.x, entity.y)
  ctx.arc(entity.x, entity.y, viewRadius, entity.direction - fov / 2, entity.direction + fov / 2)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = color
  ctx.globalAlpha = 0.3
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(entity.x, entity.y)
  ctx.arc(entity.x, entity.y, viewRadius, entity.direction - fov / 2, entity.direction + fov / 2)
  ctx.closePath()
  ctx.stroke()

  ctx.globalAlpha = 1

  // Круг — сам объект
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(entity.x, entity.y, radius, 0, 2 * Math.PI)
  ctx.fill()
}

let animationFrameId

function animate() {
  const ctx = canvas.value.getContext('2d')
  if (isRunning.value) {
    environment.value?.update(simulationSpeed.value)
    updateCurrentCounts()
  }
  drawEnvironment(ctx, environment.value)
  animationFrameId = requestAnimationFrame(animate)
}

function updateCurrentCounts() {
  if (!environment.value) {
    currentPreyCount.value = 0
    currentHunterCount.value = 0
    return
  }
  currentPreyCount.value = environment.value.preys.length
  currentHunterCount.value = environment.value.hunters.length
}

function onCanvasClick(event) {
  const rect = canvas.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top

  const entities = [
    ...environment.value.hunters.map((h) => ({ ...h, type: 'Хищник' })),
    ...environment.value.preys.map((p) => ({ ...p, type: 'Жертва' })),
  ]

  // Проверим попадание в радиус
  const clicked = entities.find((entity) => Math.hypot(entity.x - clickX, entity.y - clickY) <= 6)

  if (clicked) {
    selectedEntity.value = clicked
  } else {
    selectedEntity.value = null
  }
}

onMounted(() => {
  environment.value = createEnvironment()
  updateCurrentCounts()
  isRunning.value = false

  canvas.value.addEventListener('click', onCanvasClick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  canvas.value.removeEventListener('click', onCanvasClick)
})
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  background-color: #121212;
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sidebar {
  width: 320px;
  padding: 16px;
  background-color: #1e1e1e;
  overflow-y: auto;
  box-sizing: border-box;
  border-right: 1px solid #333;
}

.info-panel {
  width: 220px;
  padding: 16px;
  background-color: #1e1e1e;
  overflow-y: auto;
  box-sizing: border-box;
  border-left: 1px solid #333;
}

.control-group {
  margin-bottom: 12px;
}

.control-group label {
  display: block;
  margin-bottom: 4px;
}

input[type='range'] {
  width: 100%;
}

button {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #333;
  border: none;
  color: #eee;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #555;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}
canvas {
  border: 1px solid #555;
  background-color: #000;
}
</style>
