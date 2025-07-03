export default class Hunter {
  constructor(x, y, speed = 0.3, fov = 90, viewDistance = 150, energyConsumption = 0.07) {
    this.x = x
    this.y = y
    this.speed = speed
    this.fov = (fov * Math.PI) / 180
    this.viewDistance = viewDistance
    this.direction = Math.random() * 2 * Math.PI

    this.energy = 90 // стартовая энергия
    this.energyConsumption = energyConsumption
    this.isDead = false
    this.reproductionCooldown = 1000
  }

  move(width, height, preys, simulationSpeed = 1) {
    if (this.isDead) return // мёртвый не двигается

    const radius = 6
    let oldX = this.x
    let oldY = this.y

    // Если энергия меньше 90%, охотимся
    if (this.energy < 90) {
      // Ищем ближайшую видимую жертву
      const visible = preys.filter((p) => this.isInFOV(p.x, p.y, this.viewDistance))
      if (visible.length > 0) {
        let closest = null,
          minD = Infinity
        for (const p of visible) {
          const dx = p.x - this.x,
            dy = p.y - this.y,
            d = Math.hypot(dx, dy)
          if (d < minD) {
            minD = d
            closest = p
          }
        }
        if (closest) {
          const dx = closest.x - this.x,
            dy = closest.y - this.y,
            dist = Math.hypot(dx, dy)
          this.direction = Math.atan2(dy, dx)
          this.x += (dx / dist) * this.speed * simulationSpeed
          this.y += (dy / dist) * this.speed * simulationSpeed

          // Если приблизился достаточно, "съедаем" жертву и восстанавливаем энергию
          if (dist < radius + 2) {
            closest.isDead = true // жертва умирает
            const eatEnergy = 50
            this.energy = Math.min(this.energy + eatEnergy, 100)
          }
        }
      } else {
        this.randomStep(simulationSpeed)
      }
    } else {
      // Энергия > 90%, просто гуляем
      this.randomStep(simulationSpeed)
    }

    // Отскок от стен
    let bounced = false
    if (this.x < radius) {
      this.x = radius + this.speed
      this.direction = Math.PI - this.direction + (Math.random() * 0.4 - 0.2)
      bounced = true
    } else if (this.x > width - radius) {
      this.x = width - radius - this.speed
      this.direction = Math.PI - this.direction + (Math.random() * 0.4 - 0.2)
      bounced = true
    }
    if (this.y < radius) {
      this.y = radius + this.speed
      this.direction = -this.direction + (Math.random() * 0.4 - 0.2)
      bounced = true
    } else if (this.y > height - radius) {
      this.y = height - radius - this.speed
      this.direction = -this.direction + (Math.random() * 0.4 - 0.2)
      bounced = true
    }
    this.direction = ((this.direction % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    if (bounced) {
      this.x += Math.cos(this.direction) * this.speed * simulationSpeed
      this.y += Math.sin(this.direction) * this.speed * simulationSpeed
    }

    // Шум
    this.direction += (Math.random() - 0.5) * 0.2

    // Тратим энергию за пройденное расстояние
    const distMoved = Math.hypot(this.x - oldX, this.y - oldY)
    this.energy -= distMoved * this.energyConsumption
    if (this.energy <= 0) {
      this.energy = 0
      this.isDead = true // умираем
    }

    //Кулдаун размножения
    if (this.reproductionCooldown > 0) this.reproductionCooldown--
  }

  isInFOV(targetX, targetY, maxDistance = this.viewDistance) {
    const dx = targetX - this.x,
      dy = targetY - this.y
    const dist = Math.hypot(dx, dy)
    if (dist > maxDistance) return false
    let ang = Math.atan2(dy, dx),
      diff = ang - this.direction
    while (diff > Math.PI) diff -= 2 * Math.PI
    while (diff < -Math.PI) diff += 2 * Math.PI
    return Math.abs(diff) < this.fov / 2
  }

  randomStep(simulationSpeed) {
    this.direction += (Math.random() - 0.5) * 0.5
    this.x += Math.cos(this.direction) * this.speed * simulationSpeed
    this.y += Math.sin(this.direction) * this.speed * simulationSpeed
  }

  tryReproduce() {
    const energyCost = 50
    if (this.isDead) return null
    if (this.reproductionCooldown === 0 && this.energy >= energyCost) {
      this.reproductionCooldown = 800
      this.energy -= energyCost

      const offsetX = (Math.random() - 0.5) * 20
      const offsetY = (Math.random() - 0.5) * 20
      const baby = new Hunter(this.x + offsetX, this.y + offsetY)
      baby.energy = energyCost / 2
      // копируем параметры родителя
      baby.speed = this.speed
      baby.fov = this.fov
      baby.viewDistance = this.viewDistance
      baby.reproductionCooldown = 500
      return baby
    }
    return null
  }
}
