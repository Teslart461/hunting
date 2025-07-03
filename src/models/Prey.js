export default class Prey {
  constructor(x, y, speed = 0.4, fov = 120, viewDistance = 150) {
    this.x = x
    this.y = y
    this.speed = speed
    this.fov = (fov * Math.PI) / 180
    this.viewDistance = viewDistance
    this.direction = Math.random() * 2 * Math.PI
  }

  move(width, height, hunters, grassZones, simulationSpeed = 1) {
    const radius = 6
    // 1. Решаем, куда бежать
    const visibleHunters = hunters.filter((h) => this.isInFOV(h.x, h.y, this.viewDistance))
    if (visibleHunters.length > 0) {
      // бежим от ближайшего
      let closest = null,
        minD = Infinity
      for (const h of visibleHunters) {
        const dx = h.x - this.x,
          dy = h.y - this.y,
          d = Math.hypot(dx, dy)
        if (d < minD) {
          minD = d
          closest = h
        }
      }
      if (closest) {
        const dx = this.x - closest.x,
          dy = this.y - closest.y,
          dist = Math.hypot(dx, dy)
        this.direction = Math.atan2(dy, dx)
        this.x += (dx / dist) * this.speed * simulationSpeed
        this.y += (dy / dist) * this.speed * simulationSpeed
      }
    } else {
      // Хищников нет — ищем еду и идём к ней
      this.seekFoodOrWander(grassZones, simulationSpeed)
    }

    // 2. Отскок от стен
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

    // 3. небольшой шум в направлении
    this.direction += (Math.random() - 0.5) * 0.3
  }

  // Метод для поиска еды или случайного блуждания
  seekFoodOrWander(grassZones, simulationSpeed) {
    let closestFood = null
    let closestZone = null
    let minD = Infinity

    for (const zone of grassZones) {
      for (const food of zone.foodItems) {
        const d = Math.hypot(food.x - this.x, food.y - this.y)
        if (d < minD && d < this.viewDistance) {
          minD = d
          closestFood = food
          closestZone = zone
        }
      }
    }

    if (closestFood) {
      // Двигаемся к еде
      const dx = closestFood.x - this.x
      const dy = closestFood.y - this.y
      const dist = Math.hypot(dx, dy)
      this.direction = Math.atan2(dy, dx)
      this.x += (dx / dist) * this.speed * simulationSpeed
      this.y += (dy / dist) * this.speed * simulationSpeed

      // Если очень близко — едим
      if (dist < 5) {
        const idx = closestZone.foodItems.indexOf(closestFood)
        if (idx !== -1) {
          closestZone.foodItems.splice(idx, 1)
        }
      }
    } else {
      this.randomStep(simulationSpeed)
    }
  }

  // Проверяем, видно ли цель в поле зрения
  isInFOV(targetX, targetY, maxDistance = this.viewDistance) {
    const dx = targetX - this.x
    const dy = targetY - this.y
    const dist = Math.hypot(dx, dy)
    if (dist > maxDistance) return false
    let ang = Math.atan2(dy, dx)
    let diff = ang - this.direction
    while (diff > Math.PI) diff -= 2 * Math.PI
    while (diff < -Math.PI) diff += 2 * Math.PI
    return Math.abs(diff) < this.fov / 2
  }

  randomStep(simulationSpeed) {
    this.direction += (Math.random() - 0.5) * 0.5
    this.x += Math.cos(this.direction) * this.speed * simulationSpeed
    this.y += Math.sin(this.direction) * this.speed * simulationSpeed
  }
}
