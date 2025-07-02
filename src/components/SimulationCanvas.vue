<template>
  <canvas ref="canvas" :width="width" :height="height" class="simulation-canvas"></canvas>
</template>

<script setup>
import { watch, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  width: Number,
  height: Number,
  environment: Object,
  isRunning: Boolean,
  simulationSpeed: Number,
})

const canvas = ref(null)
let rafId = null

function drawEntity(ctx, e, color) {
  const r = 6,
    { x, y, fov, viewDistance, direction } = e
  ctx.fillStyle = color
  ctx.globalAlpha = 0.1
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.arc(x, y, viewDistance, direction - fov / 2, direction + fov / 2)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fill()
}

function draw() {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, props.width, props.height)
  if (props.environment) {
    props.environment.update(props.simulationSpeed)
    props.environment.preys.forEach((p) => drawEntity(ctx, p, '#4caf50')) // зеленый
    props.environment.hunters.forEach((h) => drawEntity(ctx, h, '#e53935')) // красный
  }
}

function animate() {
  if (props.isRunning) {
    draw()
  }
  rafId = requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
})

watch(
  () => props.isRunning,
  (val) => {
    if (val) {
      animate()
    } else {
      cancelAnimationFrame(rafId)
    }
  },
)
</script>

<style scoped>
.simulation-canvas {
  background-color: #1e1e1e;
  border-radius: 6px;
  box-shadow: 0 0 12px #222;
  flex-shrink: 0;
  width: 800px;
  height: 600px;
  display: block;
  margin: 1em;
}
</style>
