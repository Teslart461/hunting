export default class Prey {
  constructor(
    x,
    y,
    speed = 0.4,
    fov = 120,
    viewDistance = 150,
    energyConsumption = 0.05,
    reproductionCooldownTime = 500,
    hidingSafeTimeThreshold = 100,
  ) {
    this.x = x
    this.y = y
    this.speed = speed
    this.fov = (fov * Math.PI) / 180
    this.viewDistance = viewDistance
    this.direction = Math.random() * 2 * Math.PI

    this.energy = 80 // стартовая энергия
    this.energyConsumption = energyConsumption
    this.isDead = false
    this.reproductionCooldown = reproductionCooldownTime
    this.reproductionCooldownTime = reproductionCooldownTime
    this.state = 'wander' // состояния: wander, hungry, seekFood

    this.isHiding = false
    this.safeTime = 0
    this.hidingSafeTimeThreshold = hidingSafeTimeThreshold

    this.closestFood = null
    this.foodTargetUpdateCounter = 0
  }

  move(width, height, hunters, grassZones, shelterZones, simulationSpeed = 1) {
    if (this.isDead) return

    const radius = 6
    let oldX = this.x
    let oldY = this.y

    // 1. Проверяем наличие хищников
    const visibleHunters = hunters.filter((h) => this.isInFOV(h.x, h.y, this.viewDistance))

    if (this.isHiding) {
      if (visibleHunters.length === 0) {
        this.safeTime++
      } else {
        this.safeTime = 0
      }

      // Если уже долго спокойно, выходим
      if (this.safeTime > this.hidingSafeTimeThreshold) {
        this.isHiding = false
        this.safeTime = 0
      }

      // Прикрылись — почти не двигаемся и не тратим энергию
      this.energy -= 0.005 * simulationSpeed
      if (this.energy < 0) {
        this.energy = 0
        this.isDead = true
      }
      return
    }

    if (visibleHunters.length > 0) {
      const closestHunter = visibleHunters.reduce((a, b) =>
        Math.hypot(a.x - this.x, a.y - this.y) < Math.hypot(b.x - this.x, b.y - this.y) ? a : b,
      )

      // Ищем ближайшее убежище
      let closestShelter = null
      let minD = Infinity

      for (const shelter of shelterZones) {
        const dxShelter = shelter.x - this.x
        const dyShelter = shelter.y - this.y
        const distShelter = Math.hypot(dxShelter, dyShelter)

        const dxHunter = closestHunter.x - this.x
        const dyHunter = closestHunter.y - this.y

        const angleToShelter = Math.atan2(dyShelter, dxShelter)
        const angleToHunter = Math.atan2(dyHunter, dxHunter)
        let diff = angleToShelter - angleToHunter
        while (diff > Math.PI) diff -= 2 * Math.PI
        while (diff < -Math.PI) diff += 2 * Math.PI

        // Укрытие подходит, если оно не «спереди» у хищника или оно совсем близко к жертве
        if (Math.abs(diff) > Math.PI / 3 || distShelter < 60) {
          if (distShelter < minD) {
            minD = distShelter
            closestShelter = shelter
          }
        }
      }

      if (closestShelter) {
        const dx = closestShelter.x - this.x
        const dy = closestShelter.y - this.y
        const dist = Math.hypot(dx, dy)
        this.direction = Math.atan2(dy, dx)
        this.x += (dx / dist) * this.speed * simulationSpeed
        this.y += (dy / dist) * this.speed * simulationSpeed

        if (dist < closestShelter.radius - radius) {
          this.isHiding = true
          return
        }
      } else {
        // Убегаем от ближайшего хищника
        const dx = this.x - closestHunter.x
        const dy = this.y - closestHunter.y
        const dist = Math.hypot(dx, dy)
        this.direction = Math.atan2(dy, dx)
        this.x += (dx / dist) * this.speed * simulationSpeed
        this.y += (dy / dist) * this.speed * simulationSpeed
      }

      this.state = 'wander'
    } else {
      // Нет хищников — обычное поведение
      if (this.energy < 20) {
        this.state = 'seekFood'
      } else if (this.energy > 30) {
        this.state = 'wander'
      } else {
        this.state = 'hungry'
      }

      if (this.state === 'seekFood') {
        this.seekFoodOrWander(grassZones, simulationSpeed)
      } else if (this.state === 'hungry') {
        if (Math.random() < 0.5) {
          this.seekFoodOrWander(grassZones, simulationSpeed)
        } else {
          this.randomStep(simulationSpeed)
        }
      } else {
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
    if (bounced) {
      this.x += Math.cos(this.direction) * this.speed * simulationSpeed
      this.y += Math.sin(this.direction) * this.speed * simulationSpeed
    }

    // 3. Шум
    this.direction += (Math.random() - 0.5) * 0.3

    // Расход энергии
    const distMoved = Math.hypot(this.x - oldX, this.y - oldY)
    this.energy -= distMoved * this.energyConsumption
    if (this.energy <= 0) {
      this.energy = 0
      this.isDead = true
    }

    if (this.reproductionCooldown > 0) this.reproductionCooldown--
  }

  // Метод для поиска еды или случайного блуждания
  seekFoodOrWander(grassZones, simulationSpeed) {
    // Обновляем цель еды раз в N тиков
    if (this.foodTargetUpdateCounter <= 0 || !this.closestFood || this.closestFood.isEaten) {
      this.closestFood = this.findClosestFood(grassZones)
      this.foodTargetUpdateCounter = 10 // например, каждые 10 тиков
    } else {
      this.foodTargetUpdateCounter--
    }

    if (this.closestFood) {
      const dx = this.closestFood.x - this.x
      const dy = this.closestFood.y - this.y
      const dist = Math.hypot(dx, dy)
      this.direction = Math.atan2(dy, dx)
      this.x += (dx / dist) * this.speed * simulationSpeed
      this.y += (dy / dist) * this.speed * simulationSpeed

      if (dist < 5) {
        this.closestFood.isEaten = true
        this.energy = Math.min(this.energy + 30, 100)
        this.closestFood = null
      }
    } else {
      this.randomStep(simulationSpeed)
    }
  }

  findClosestFood(grassZones) {
    let closest = null
    let minD = Infinity
    for (const zone of grassZones) {
      for (const food of zone.foodItems) {
        if (food.isEaten) continue
        const d = Math.hypot(food.x - this.x, food.y - this.y)
        if (d < minD && d < this.viewDistance) {
          minD = d
          closest = food
        }
      }
    }
    return closest
  }

  // Проверяем, видно ли цель в поле зрения
  isInFOV(targetX, targetY, maxDistance = this.viewDistance) {
    if (this.isHiding) return false
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

  tryReproduce() {
    const energyCost = 40
    if (this.isDead || this.isHiding) return null
    if (this.reproductionCooldown <= 0 && this.energy >= energyCost) {
      this.reproductionCooldown = this.reproductionCooldownTime
      this.energy -= energyCost

      // Создаём потомка рядом
      const offsetX = (Math.random() - 0.5) * 20
      const offsetY = (Math.random() - 0.5) * 20
      const baby = new Prey(this.x + offsetX, this.y + offsetY)
      baby.energy = energyCost / 2
      // копируем параметры родителя
      baby.speed = this.speed
      baby.fov = this.fov
      baby.viewDistance = this.viewDistance
      baby.energyConsumption = this.energyConsumption
      baby.reproductionCooldown = this.reproductionCooldownTime
      baby.reproductionCooldownTime = this.reproductionCooldownTime
      baby.hidingSafeTimeThreshold = this.hidingSafeTimeThreshold
      return baby
    }
    return null
  }
}
