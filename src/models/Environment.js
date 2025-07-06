import Prey from './Prey'
import Hunter from './Hunter'
import GrassZone from './GrassZone'
import ShelterZone from './ShelterZone'

export default class Environment {
  constructor(
    width,
    height,
    preyCount = 30,
    hunterCount = 3,
    grassZoneCount = 3,
    grassRegenerationRate = 0.02,
    shelterZoneCount = 2,
  ) {
    this.width = width
    this.height = height
    this.preys = Array.from(
      { length: preyCount },
      () => new Prey(Math.random() * width, Math.random() * height),
    )
    this.hunters = Array.from(
      { length: hunterCount },
      () => new Hunter(Math.random() * width, Math.random() * height),
    )

    // Случайные зоны травы
    this.grassZones = []
    this.shelterZones = []

    // Добавляем зоны травы
    for (let i = 0; i < grassZoneCount; i++) {
      let zone
      let attempts = 0
      do {
        const radius = 50 + Math.random() * 100
        const maxFood = 50 + Math.floor(Math.random() * 100)
        const x = radius + Math.random() * (width - radius * 2)
        const y = radius + Math.random() * (height - radius * 2)
        zone = new GrassZone(x, y, radius, maxFood, grassRegenerationRate)
        attempts++
      } while (
        this.checkOverlap(zone, [...this.grassZones, ...this.shelterZones]) &&
        attempts < 100
      )
      this.grassZones.push(zone)
    }

    // Добавляем укрытия
    for (let i = 0; i < shelterZoneCount; i++) {
      let shelter
      let attempts = 0
      do {
        const radius = 30 + Math.random() * 50
        const x = radius + Math.random() * (width - radius * 2)
        const y = radius + Math.random() * (height - radius * 2)
        shelter = new ShelterZone(x, y, radius)
        attempts++
      } while (
        this.checkOverlap(shelter, [...this.grassZones, ...this.shelterZones]) &&
        attempts < 100
      )
      this.shelterZones.push(shelter)
    }
  }

  // Проверка, пересекается ли zone с другими зонами
  checkOverlap(newZone, existingZones) {
    for (const zone of existingZones) {
      const dx = newZone.x - zone.x
      const dy = newZone.y - zone.y
      const distance = Math.hypot(dx, dy)
      if (distance < newZone.radius + zone.radius) {
        return true // Пересекаются
      }
    }
    return false
  }

  update(simulationSpeed = 1) {
    // 1. Хищники
    const newHunters = []
    for (const hunter of this.hunters) {
      if (!hunter.isDead) {
        hunter.move(this.width, this.height, this.preys, simulationSpeed)
        const baby = hunter.tryReproduce()
        if (baby) {
          newHunters.push(baby)
        }
      }
    }
    // 2. Жертвы
    const newPreys = []
    for (const prey of this.preys) {
      if (!prey.isDead) {
        prey.move(
          this.width,
          this.height,
          this.hunters,
          this.grassZones,
          this.shelterZones,
          simulationSpeed,
        )
        const baby = prey.tryReproduce()
        if (baby) {
          newPreys.push(baby)
        }
      }
    }

    // 3. Удаляем мёртвых
    this.hunters = this.hunters.filter((h) => !h.isDead)
    this.preys = this.preys.filter((p) => !p.isDead)

    // 4. Убираем съеденные кусочки еды и работаем с зонами
    for (const zone of this.grassZones) {
      zone.foodItems = zone.foodItems.filter((item) => !item.isEaten)
      zone.regenerate()
    }

    // 5. Добавление потомков
    this.preys.push(...newPreys)
    this.hunters.push(...newHunters)
  }
}
