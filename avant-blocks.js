class Block {
    constructor(x, y, direction, isWall=false) {
        this.x = x
        this.y = y
        this.direction = direction
        this.isWall = isWall
    }

    updatePosition() {
        // TODO Add handling for wall collisions
        // TODO Add handling for cell collisions

        switch(this.direction) {
            case 'up':
                this.y += 1
                break
            case 'down':
                this.y -= 1
                break
            case 'left':
                this.x -= 1
                break
            case 'right':
                this.x += 1
                break
        }
    }

    reverseDirection() {
        switch(this.direction) {
            case 'up':
                this.direction = 'down'
                break
            case 'down':
                this.direction = 'up'
                break
            case 'left':
                this.direction = 'right'
                break
            case 'right':
                this.direction = 'left'
                break
        }
    }

    getColor() {
        let colorMapping = {
            'up'   : 'blue',
            'down' : 'green',
            'left' : 'orange',
            'right': 'red'
        }

        return colorMapping[this.direction]
    }
}

class AvantBlock {
    constructor(gridSize, cellSize=50) {
        this.gridSize = gridSize
        this.cellSize = cellSize
        this.blocks = []

        // Initialize the center cell with a Block moving up
        let centerPos = Math.floor(gridSize / 2)
        this.blocks.push(new Block(centerPos, centerPos, 'up'))
        this.blocks.push(new Block(centerPos, centerPos, 'right'))
    }

    updateBlocks() {
        this.blocks.forEach((block) => {
            // Check for wall colision
            let x =  block.x
            let y =  block.y
            if (x == 1 || x == this.gridSize || y == 1 || y == this.gridSize) {
                block.reverseDirection()
                block.updatePosition()
            // TODO Add check for block-block collisions
            } else {
                block.updatePosition()
            }
        })
    }
    
    drawBlocks() {
        // Clear grid
        this.drawGrid()
        let cellSize = this.cellSize

        // Flip y-display so (1, 1) is bottom-left instead of top-left
        let bottomYPos = this.cellSize * this.gridSize

        this.blocks.forEach((block) => {
            let blockColor = block.getColor()
            fill(blockColor)
            stroke(blockColor)
            rect((block.x-1)*cellSize, bottomYPos - block.y*cellSize, cellSize, cellSize)
        })
    }

    // Draw empty grid
    drawGrid() {
        fill(255)
        stroke(0)
        let cellSize = this.cellSize

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                rect(x*cellSize, y*cellSize, cellSize, cellSize)
            }
        }
    }
}

grid = new AvantBlock(9)
bpm = 120

function setup() {
    frameRate(Math.floor(bpm/60))
    createCanvas(512, 512)
}

function draw() {
    // TODO Add creation of block upon mouse click in grid
    grid.updateBlocks()
    grid.drawBlocks()
}
