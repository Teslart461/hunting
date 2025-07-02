<template>
  <div style="max-width: 900px; margin: auto">
    <canvas
      ref="canvas"
      :width="width"
      :height="height"
      style="border: 1px solid #333; background: #fafafa"
    />
    <p>Живых жертв: {{ preyCount }}</p>

    <div class="controls">
      <label>
        Скорость симуляции: {{ simulationSpeed.toFixed(1) }}
        <input type="range" min="0.5" max="5" step="0.1" v-model.number="simulationSpeed" />
      </label>

      <fieldset>
        <legend>Жертвы</legend>
        <label>
          Скорость: {{ preySpeed.toFixed(1) }}
          <input type="range" min="0.1" max="5" step="0.1" v-model.number="preySpeed" />
        </label>
        <label>
          Угол обзора: {{ preyFov }}°
          <input type="range" min="30" max="180" step="1" v-model.number="preyFov" />
        </label>
        <label>
          Дальность: {{ preyViewDistance }}
          <input type="range" min="50" max="300" step="10" v-model.number="preyViewDistance" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Хищники</legend>
        <label>
          Скорость: {{ hunterSpeed.toFixed(1) }}
          <input type="range" min="0.1" max="5" step="0.1" v-model.number="hunterSpeed" />
        </label>
        <label>
          Угол обзора: {{ hunterFov }}°
          <input type="range" min="30" max="180" step="1" v-model.number="hunterFov" />
        </label>
        <label>
          Дальность: {{ hunterViewDistance }}
          <input type="range" min="50" max="300" step="10" v-model.number="hunterViewDistance" />
        </label>
      </fieldset>

      <button @click="toggleSimulation">
        {{ isRunning ? 'Пауза' : 'Старт' }}
      </button>
      <button @click="resetSimulation">Сбросить</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import Environment from '@/models/Environment'

const width = 800
const height = 600
const canvas = ref(null)
const environment = ref(null)

const isRunning = ref(true)
const simulationSpeed = ref(1)

const preySpeed = ref(0.4)
const preyFov = ref(120)
const preyViewDistance = ref(150)

const hunterSpeed = ref(0.3)
const hunterFov = ref(90)
const hunterViewDistance = ref(150)

const preyCount = computed(() => environment.value?.preys.length || 0)

function createEnvironment() {
  const env = new Environment(width, height, 30, 3)
  env.preys.forEach((p) => {
    p.speed = preySpeed.value
    p.fov = (preyFov.value * Math.PI) / 180
    p.viewDistance = preyViewDistance.value
  })
  env.hunters.forEach((h) => {
    h.speed = hunterSpeed.value
    h.fov = (hunterFov.value * Math.PI) / 180
    h.viewDistance = hunterViewDistance.value
  })
  return env
}

watch([preySpeed, preyFov, preyViewDistance], () => {
  if (!environment.value) return
  environment.value.preys.forEach((p) => {
    p.speed = preySpeed.value
    p.fov = (preyFov.value * Math.PI) / 180
    p.viewDistance = preyViewDistance.value
  })
})

watch([hunterSpeed, hunterFov, hunterViewDistance], () => {
  if (!environment.value) return
  environment.value.hunters.forEach((h) => {
    h.speed = hunterSpeed.value
    h.fov = (hunterFov.value * Math.PI) / 180
    h.viewDistance = hunterViewDistance.value
  })
})

function toggleSimulation() {
  isRunning.value = !isRunning.value
}

function resetSimulation() {
  environment.value = createEnvironment()
}

function drawEntity(ctx, e, color) {
  const r = 6,
    { x, y, fov, viewDistance, direction } = e
  // конус обзора
  ctx.fillStyle = color
  ctx.globalAlpha = 0.1
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.arc(x, y, viewDistance, direction - fov / 2, direction + fov / 2)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  // тело
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fill()
}

function draw() {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  environment.value.update(simulationSpeed.value)
  environment.value.preys.forEach((p) => drawEntity(ctx, p, 'green'))
  environment.value.hunters.forEach((h) => drawEntity(ctx, h, 'red'))
}

let raf
function animate() {
  if (isRunning.value && environment.value) draw()
  raf = requestAnimationFrame(animate)
}

onMounted(() => {
  environment.value = createEnvironment()
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.controls {
  margin-top: 1em;
}
.controls label {
  display: block;
  margin-bottom: 0.5em;
}
fieldset {
  margin: 1em 0;
  border: 1px solid #ccc;
  padding: 0.5em;
}
legend {
  font-weight: bold;
}
button {
  margin-right: 0.5em;
}
</style>
