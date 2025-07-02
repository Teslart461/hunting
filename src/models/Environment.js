import Prey from './Prey'
import Hunter from './Hunter'

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
  }

  update(simulationSpeed = 1) {
    // 1. Хищники
    for (const hunter of this.hunters) {
      hunter.move(this.width, this.height, this.preys, simulationSpeed)
      // проверка поедания
      this.preys = this.preys.filter((prey) => {
        const dx = prey.x - hunter.x,
          dy = prey.y - hunter.y
        return Math.hypot(dx, dy) > 10
      })
    }
    // 2. Жертвы
    for (const prey of this.preys) {
      prey.move(this.width, this.height, this.hunters, simulationSpeed)
    }
  }
}
