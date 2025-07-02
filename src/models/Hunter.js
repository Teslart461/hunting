export default class Hunter {
  constructor(x, y, speed = 0.3, fov = 90, viewDistance = 150) {
    this.x = x
    this.y = y
    this.speed = speed
    this.fov = (fov * Math.PI) / 180
    this.viewDistance = viewDistance
    this.direction = Math.random() * 2 * Math.PI
  }

  move(width, height, preys, simulationSpeed = 1) {
    const radius = 6
    // 1. Идём к ближайшей видимой жертве
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
      }
    } else {
      this._randomStep(simulationSpeed)
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

    // 3. шум
    this.direction += (Math.random() - 0.5) * 0.2
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

  _randomStep(simulationSpeed) {
    this.direction += (Math.random() - 0.5) * 0.5
    this.x += Math.cos(this.direction) * this.speed * simulationSpeed
    this.y += Math.sin(this.direction) * this.speed * simulationSpeed
  }
}
