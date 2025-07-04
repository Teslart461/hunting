export default class GrassZone {
  constructor(x, y, radius, maxFood, regenerationRate = 0.02) {
    this.x = x
    this.y = y
    this.radius = radius
    this.maxFood = maxFood
    this.food = maxFood
    this.foodItems = []
    this.regenerationRate = regenerationRate
  }

  regenerate() {
    if (this.food < this.maxFood) {
      this.food += this.regenerationRate
    }
    if (this.foodItems.length < this.maxFood / 2 && Math.random() < this.regenerationRate) {
      this.spawnFoodItem()
    }
  }

  spawnFoodItem() {
    // создаём объект еды внутри радиуса
    const angle = Math.random() * Math.PI * 2
    const distance = Math.sqrt(Math.random()) * this.radius
    const fx = this.x + Math.cos(angle) * distance
    const fy = this.y + Math.sin(angle) * distance
    this.foodItems.push({ x: fx, y: fy, isEaten: false })
  }
}
