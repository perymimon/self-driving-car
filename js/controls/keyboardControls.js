export default class KeyboardControls {
    constructor() {
        this.forward = false
        this.left = false
        this.right = false
        this.reverse = false
        this.#addKeyboardListeners()

    }

    #addKeyboardListeners() {
        document.onkeydown = (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    this.forward = true
                    break;
                case 'ArrowRight':
                    this.right = true
                    break
                case 'ArrowLeft':
                    this.left = true
                    break
                case 'ArrowDown':
                    this.reverse = true
            }
            // console.table(this)
        }

        document.onkeyup = (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    this.forward = false
                    break
                case 'ArrowRight':
                    this.right = false
                    break
                case 'ArrowLeft':
                    this.left = false
                    break
                case 'ArrowDown':
                    this.reverse = false
                    break
            }
            // console.table(this)
        }
    }

}