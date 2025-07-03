export default class Prey {
  constructor(x, y, speed = 0.4, fov = 120, viewDistance = 150) {
    this.x = x
    this.y = y
    this.speed = speed
    this.fov = (fov * Math.PI) / 180
    this.viewDistance = viewDistance
    this.direction = Math.random() * 2 * Math.PI
    this.energy = 80 // стартовая энергия
    this.isDead = false

    this.state = 'wander' // состояния: wander, hungry, seekFood
  }

  move(width, height, hunters, grassZones, simulationSpeed = 1) {
    if (this.isDead) return // мёртвый не двигается

    const radius = 6
    let oldX = this.x
    let oldY = this.y
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
        this.state = 'wander' // при угрозе — игнорируем еду
      }
    } else {
      // нет хищников — меняем состояние по энергии
      if (this.energy < 20) {
        this.state = 'seekFood'
      } else if (this.energy > 30) {
        this.state = 'wander'
      } else {
        this.state = 'hungry'
      }

      // поведение по состоянию
      if (this.state === 'seekFood') {
        this.seekFoodOrWander(grassZones, simulationSpeed)
      } else if (this.state === 'hungry') {
        // В состоянии "голодна" — с 50% вероятностью ищем еду, иначе гуляем
        if (Math.random() < 0.5) {
          this.seekFoodOrWander(grassZones, simulationSpeed)
        } else {
          this.randomStep(simulationSpeed)
        }
      } else {
        // wander
        this.randomStep(simulationSpeed)
      }
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

    // Тратим энергию за пройденное расстояние
    const distMoved = Math.hypot(this.x - oldX, this.y - oldY)
    this.energy -= distMoved * 0.1 // Коэффициент под баланс
    if (this.energy <= 0) {
      this.energy = 0
      this.isDead = true
    }
  }

  // Метод для поиска еды или случайного блуждания
  seekFoodOrWander(grassZones, simulationSpeed) {
    let closestFood = null
    let closestZone = null
    let minD = Infinity

    // Найти ближайший кусочек еды среди всех зон
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

    // Если нашли — бежим к нему и, достигнув, помечаем isEaten
    if (closestFood) {
      const dx = closestFood.x - this.x
      const dy = closestFood.y - this.y
      const dist = Math.hypot(dx, dy)
      this.direction = Math.atan2(dy, dx)
      this.x += (dx / dist) * this.speed * simulationSpeed
      this.y += (dy / dist) * this.speed * simulationSpeed

      // съесть, если достаточно близко
      if (dist < 5) {
        closestFood.isEaten = true
        this.energy += 30
        if (this.energy > 100) this.energy = 100
      }
    } else {
      // если еды нет в пределах досягаемости — блуждаем
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
