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
      hunter.move(this.width, this.height, this.preys, simulationSpeed)
      // проверка поедания
      this.preys = this.preys.filter(
        (prey) => Math.hypot(prey.x - hunter.x, prey.y - hunter.y) > 10,
      )
    }
    // 2. Жертвы
    for (const prey of this.preys) {
      prey.move(this.width, this.height, this.hunters, this.grassZones, simulationSpeed)
    }
    // 3. Трава (Зоны)
    for (const zone of this.grassZones) {
      zone.regenerate()
    }
  }
}
