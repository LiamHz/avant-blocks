class Block {
    constructor(x, y, direction, isWall=false) {
        this.x = x
        this.y = y
        this.direction = direction
        this.isWall = isWall
        this.osc = new p5.TriOsc()
    }

    playNote(note) {
        let osc = this.osc
        osc.start()
        osc.amp(0)
        osc.freq(midiToFreq(note))
        osc.fade(0.5, 0.1) // Fade in (i.e. attack)
        osc.fade(0.0, 0.4) // Fade out(i.e. release)
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
        // Midi A-minor pentatonic scale
        // TODO Dynamically extend to `gridSize` notes
        scale = [57, 60, 62, 64, 67, 69, 72, 74, 76]
        switch(this.direction) {
            case 'up':
                this.direction = 'down'
                this.playNote(scale[this.x])
                break
            case 'down':
                this.direction = 'up'
                this.playNote(scale[this.x])
                break
            case 'left':
                this.direction = 'right'
                this.playNote(scale[this.y])
                break
            case 'right':
                this.direction = 'left'
                this.playNote(scale[this.y])
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
    constructor(gridSize, canvasSize) {
        this.gridSize = gridSize
        this.cellSize = canvasSize/gridSize
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

let bpm = 80
let isUp = true
let started = false
let canvasSize = 512
let grid = new AvantBlock(9, canvasSize)

// Start draw loop
function mousePressed() {
    // TODO Don't add Block on intial mouse press
    if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
        let gridSize = grid.gridSize
        let cellSize = grid.cellSize
        let bottomYPos = cellSize * gridSize
        let x = Math.floor(mouseX/cellSize) + 1
        let y = Math.floor(((bottomYPos - mouseY)/cellSize)) + 1
        // TODO Make direction of created block determined by HTML button
        isUp = !isUp
        let dir = (isUp) ? 'up' : 'right'
        grid.blocks.push(new Block(x, y, dir))
    }
    started = true
}

function setup() {
    createDiv("Click to start")
    frameRate(Math.floor(2*4*bpm/60))
    // 2* is used b/c each grid cell is an 1/8th note
    // 4* is used b/c we want to play a note every 1/4 note
    
    pixelDensity(1) // Normalize for high density displays
    createCanvas(canvasSize, canvasSize)
}

function draw() {
    // TODO Add creation of block upon mouse click in grid

    // Wait until mousePressed() has occurred
    // Required due to Chrome security features with audio
    if (started) {
        grid.drawBlocks()
        grid.updateBlocks()
    }
}
