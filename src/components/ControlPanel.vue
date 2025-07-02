<template>
  <div class="controls-panel">
    <h2>Параметры симуляции</h2>
    <p>
      Живых жертв: <strong>{{ preyCount }}</strong>
    </p>

    <label>
      Скорость симуляции: {{ simulationSpeed.toFixed(1) }}
      <input
        type="range"
        min="0.5"
        max="5"
        step="0.1"
        :value="simulationSpeed"
        @input="$emit('update:simulationSpeed', +$event.target.value)"
      />
    </label>

    <fieldset>
      <legend>Жертвы</legend>
      <label>
        Скорость: {{ preySpeed.toFixed(1) }}
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          :value="preySpeed"
          @input="$emit('update:preySpeed', +$event.target.value)"
        />
      </label>
      <label>
        Угол обзора: {{ preyFov }}°
        <input
          type="range"
          min="30"
          max="180"
          step="1"
          :value="preyFov"
          @input="$emit('update:preyFov', +$event.target.value)"
        />
      </label>
      <label>
        Дальность: {{ preyViewDistance }}
        <input
          type="range"
          min="50"
          max="300"
          step="10"
          :value="preyViewDistance"
          @input="$emit('update:preyViewDistance', +$event.target.value)"
        />
      </label>
    </fieldset>

    <fieldset>
      <legend>Хищники</legend>
      <label>
        Скорость: {{ hunterSpeed.toFixed(1) }}
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          :value="hunterSpeed"
          @input="$emit('update:hunterSpeed', +$event.target.value)"
        />
      </label>
      <label>
        Угол обзора: {{ hunterFov }}°
        <input
          type="range"
          min="30"
          max="180"
          step="1"
          :value="hunterFov"
          @input="$emit('update:hunterFov', +$event.target.value)"
        />
      </label>
      <label>
        Дальность: {{ hunterViewDistance }}
        <input
          type="range"
          min="50"
          max="300"
          step="10"
          :value="hunterViewDistance"
          @input="$emit('update:hunterViewDistance', +$event.target.value)"
        />
      </label>
    </fieldset>

    <div class="buttons">
      <button @click="$emit('toggleSimulation')">
        {{ isRunning ? 'Пауза' : 'Старт' }}
      </button>
      <button @click="$emit('resetSimulation')">Сброс</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  preySpeed: Number,
  preyFov: Number,
  preyViewDistance: Number,
  hunterSpeed: Number,
  hunterFov: Number,
  hunterViewDistance: Number,
  simulationSpeed: Number,
  isRunning: Boolean,
  preyCount: Number,
})
</script>

<style scoped>
.controls-panel {
  flex: 1;
  background-color: #222;
  padding: 1em;
  color: #eee;
  overflow-y: auto;
  max-width: 350px;
  border-left: 1px solid #444;
}

h2 {
  margin-top: 0;
}

label {
  display: block;
  margin-bottom: 1em;
  font-size: 0.9rem;
}

input[type='range'] {
  width: 100%;
  margin-top: 0.3em;
}

fieldset {
  margin-bottom: 1.5em;
  border: 1px solid #444;
  padding: 0.8em 1em;
  border-radius: 6px;
}

legend {
  padding: 0 0.5em;
  font-weight: bold;
}

.buttons {
  display: flex;
  gap: 0.8em;
}

button {
  background-color: #3f51b5;
  border: none;
  color: white;
  padding: 0.7em 1.2em;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #303f9f;
}
</style>
