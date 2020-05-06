class Block {
    constructor(x, y, direction, isWall=false) {
        this.x = x
        this.y = y
        this.direction = direction
        this.isWall = isWall

        this.osc = new p5.TriOsc()
        this.delay = new p5.Delay()
        this.reverb = new p5.Reverb()
    }

    playNote(note) {
        let osc = this.osc
        let delay = this.delay
        let reverb = this.reverb

        osc.start()
        osc.amp(0)
        osc.freq(midiToFreq(note))
        osc.fade(0.5, 0.1) // Fade in (i.e. attack)
        osc.fade(0.0, 0.4) // Fade out(i.e. release)

        // Effects
        delay.process(osc, 0.4, 0.5, 2300)
        reverb.process(osc, 1.5, 5)
    }

    updatePosition() {
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
        // Midi scales
        // TODO Dynamically extend to `gridSize` notes
        // scale = [57, 60, 62, 64, 67, 69, 72, 74, 76] // A minor
        scale = [60, 62, 63, 67, 69, 72, 74, 75, 79] // C Akebono
        switch(this.direction) {
            case 'up':
                this.direction = 'down'
                this.playNote(scale[this.x-1])
                break
            case 'down':
                this.direction = 'up'
                this.playNote(scale[this.x-1])
                break
            case 'left':
                this.direction = 'right'
                this.playNote(scale[this.y-1])
                break
            case 'right':
                this.direction = 'left'
                this.playNote(scale[this.y-1])
                break
        }
    }

    collideWithBlock() {
        switch(this.direction) {
            case 'up':
                this.direction = 'left'
                break
            case 'down':
                this.direction = 'right'
                break
            case 'left':
                this.direction = 'up'
                break
            case 'right':
                this.direction = 'down'
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
    }

    arraysEqual(a, b) {
        if
        (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    isBlockCollision(x, y, blockPositions) {
        let position = [x, y]
        let samePositionCounter = 0
        blockPositions.forEach((positionToCheck) => {
            if (this.arraysEqual(position, positionToCheck)) {
                samePositionCounter += 1
            }
        })
        return samePositionCounter >= 2
    }

    // Move blocks based on collision or lack of
    updateBlocks() {
        // Store all block positions for block-block collision detection
        // TODO Refactor block-block collision detection from O(n^2) to O(n)
        let blockPositions = []
        this.blocks.forEach((block) => {
            blockPositions.push([block.x, block.y])
        })

        this.blocks.forEach((block) => {
            let x =  block.x
            let y =  block.y

            // Block-wall colision
            // TODO Add visual highlight on corresponding row / column to signify note being played
            if (((x == 1) && (block.direction == 'left')) 
              + ((y == 1) && (block.direction == 'down')) ||
              + ((x == this.gridSize) && (block.direction == 'right')) 
              + ((y == this.gridSize) && (block.direction == 'up'))) {
                block.reverseDirection()
                block.updatePosition()
            // Block-block collision
            // TODO Add check for when blocks collide by moving past each other (t=1, they're adjacent, t=2 they've swapped places)
            } else if (this.isBlockCollision(x, y, blockPositions)) {
                block.collideWithBlock()
                block.updatePosition()
            // No collision
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

let bpm = 150
let started = false
let canvasSize = 512
let grid = new AvantBlock(9, canvasSize)

// Start draw loop
function mousePressed() {
    // TODO Add BPM display
    // TODO Add scale display
    // TODO Add buttons to change BPM
    // TODO Add buttons to change scale
    // TODO Fix (prevent?) spawning of blocks when clicking on a cell with a block already present
    if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
        let gridSize = grid.gridSize
        let cellSize = grid.cellSize
        let bottomYPos = cellSize * gridSize
        let x = Math.floor(mouseX/cellSize) + 1
        let y = Math.floor(((bottomYPos - mouseY)/cellSize)) + 1
        // TODO Make direction of created block determined by HTML button
        grid.blocks.push(new Block(x, y, 'up'))
    }
    started = true
}

function setup() {
    createDiv("Click to start")
    frameRate(Math.floor(2*bpm/60))
    // 2* is used b/c each grid cell is an 1/8th note
    
    pixelDensity(1) // Normalize for high density displays
    createCanvas(canvasSize, canvasSize)
}

function draw() {
    // Wait until mousePressed() has occurred
    // Required due to Chrome security features with audio
    if (started) {
        grid.drawBlocks()
        grid.updateBlocks()
    } else {
        grid.drawGrid()
    }
}
