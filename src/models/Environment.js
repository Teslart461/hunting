import Prey from './Prey'
import Hunter from './Hunter'
import GrassZone from './GrassZone'

export default class Environment {
  constructor(width, height, preyCount = 30, hunterCount = 3, grassZoneCount = 3) {
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
    this.grassZones = Array.from({ length: grassZoneCount }, () => {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 50 + Math.random() * 100 // размер от 50 до 150
      const maxFood = 50 + Math.floor(Math.random() * 100) // еда от 50 до 150
      return new GrassZone(x, y, radius, maxFood)
    })
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
        prey.move(this.width, this.height, this.hunters, this.grassZones, simulationSpeed)
        const baby = prey.tryReproduce()
        if (baby) {
          newPreys.push(baby)
        }
      }
    }

    // 3. Удаляем мёртвых
    this.hunters = this.hunters.filter((h) => !h.isDead)
    this.preys = this.preys.filter((p) => !p.isDead)

    // 4. Убираем съеденные кусочки еды
    for (const zone of this.grassZones) {
      zone.foodItems = zone.foodItems.filter((item) => !item.isEaten)
    }

    // 5. Трава (Зоны)
    for (const zone of this.grassZones) {
      zone.regenerate()
    }

    // 6. Добавление потомков
    this.preys.push(...newPreys)
    this.hunters.push(...newHunters)
  }
}
