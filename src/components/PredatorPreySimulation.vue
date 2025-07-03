<template>
  <div class="container">
    <aside class="sidebar">
      <h2>Параметры</h2>

      <div class="control-group">
        <label>Скорость симуляции: {{ simulationSpeed.toFixed(1) }}</label>
        <input type="range" min="0.5" max="5" step="0.1" v-model.number="simulationSpeed" />
      </div>

      <h3>Жертвы</h3>
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

      <h3>Хищники</h3>
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

      <button @click="toggleSimulation">{{ isRunning ? 'Пауза' : 'Старт' }}</button>
      <button @click="resetSimulation">Сбросить</button>

      <p>Живых жертв: {{ preyCount }}</p>
    </aside>

    <main class="main-content">
      <canvas ref="canvas" :width="width" :height="height" />
    </main>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import Environment from '@/models/Environment'

const width = 1200
const height = 1000
const canvas = ref(null)
const environment = ref(null)

const simulationSpeed = ref(1.0)

const preySpeed = ref(0.4)
const preyFov = ref(120)
const preyViewDistance = ref(150)

const hunterSpeed = ref(0.3)
const hunterFov = ref(90)
const hunterViewDistance = ref(150)

const isRunning = ref(true)

const preyCount = computed(() => (environment.value ? environment.value.preys.length : 0))

function createEnvironment() {
  const env = new Environment(width, height, 30, 3)
  env.preys.forEach((prey) => {
    prey.speed = preySpeed.value
    prey.fov = (preyFov.value * Math.PI) / 180
    prey.viewDistance = preyViewDistance.value
  })
  env.hunters.forEach((hunter) => {
    hunter.speed = hunterSpeed.value
    hunter.fov = (hunterFov.value * Math.PI) / 180
    hunter.viewDistance = hunterViewDistance.value
  })
  return env
}

watch([preySpeed, preyFov, preyViewDistance], () => {
  if (!environment.value) return
  environment.value.preys.forEach((prey) => {
    prey.speed = preySpeed.value
    prey.fov = (preyFov.value * Math.PI) / 180
    prey.viewDistance = preyViewDistance.value
  })
})

watch([hunterSpeed, hunterFov, hunterViewDistance], () => {
  if (!environment.value) return
  environment.value.hunters.forEach((hunter) => {
    hunter.speed = hunterSpeed.value
    hunter.fov = (hunterFov.value * Math.PI) / 180
    hunter.viewDistance = hunterViewDistance.value
  })
})

watch(simulationSpeed, (newSpeed) => {
  // Можно будет использовать для изменения частоты обновлений или ускорения
})

function toggleSimulation() {
  isRunning.value = !isRunning.value
}

function resetSimulation() {
  environment.value = createEnvironment()
}

function drawEnvironment(ctx, env) {
  ctx.clearRect(0, 0, env.width, env.height)

  // рисуем зоны травы
  if (env.grassZones) {
    for (const zone of env.grassZones) {
      for (const food of zone.foodItems) {
        ctx.fillStyle = 'yellow'
        ctx.beginPath()
        ctx.arc(food.x, food.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
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
  }
  drawEnvironment(ctx, environment.value)
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  environment.value = createEnvironment()
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
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
