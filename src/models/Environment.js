import Prey from './Prey'
import Hunter from './Hunter'
import GrassZone from './GrassZone'

export default class Environment {
  constructor(width, height, preyCount = 30, hunterCount = 3) {
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
    this.grassZones = [
      new GrassZone(width * 0.3, height * 0.3, 100, 100),
      new GrassZone(width * 0.7, height * 0.7, 120, 100),
    ]
  }

  update(simulationSpeed = 1) {
    // 1. Хищники
    for (const hunter of this.hunters) {
      if (!hunter.isDead) {
        hunter.move(this.width, this.height, this.preys, simulationSpeed)
      }
    }
    // 2. Жертвы
    for (const prey of this.preys) {
      if (!prey.isDead) {
        prey.move(this.width, this.height, this.hunters, this.grassZones, simulationSpeed)
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
  }
}
