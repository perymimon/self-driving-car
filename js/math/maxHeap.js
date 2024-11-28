// generate GPT
class MaxHeap {
    constructor(collection = [], mapFn = null) {
        this.mapFn = typeof mapFn === 'function'
            ? mapFn
            : (typeof mapFn === 'string'
                ? (item => item[mapFn])
                : (item => item));
        this.heap = [];
        this.buildHeap(collection);
    }

    buildHeap(collection) {
        collection.forEach(item => this.add(item));
    }

    add(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMax() {
        if (this.size() < 1) return null;
        if (this.size() === 1) return this.heap.pop();

        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return max;
    }

    peek() {
        return this.size() > 0 ? this.heap[0] : null;
    }

    size() {
        return this.heap.length;
    }
    updateItem(item) {
        const index = this.heap.findIndex(i => i === item);
        if (index === -1) return false;

        // To maintain the heap, we either need to bubble the updated item up or down
        this.bubbleUp(index);
        this.bubbleDown(index);
        return true;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(index, parentIndex) > 0) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    bubbleDown(index) {
        const length = this.heap.length;
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let largest = index;

            if (leftChild < length && this.compare(leftChild, largest) > 0) {
                largest = leftChild;
            }

            if (rightChild < length && this.compare(rightChild, largest) > 0) {
                largest = rightChild;
            }

            if (largest !== index) {
                this.swap(index, largest);
                index = largest;
            } else {
                break;
            }
        }
    }

    compare(index1, index2) {
        const value1 = this.mapFn(this.heap[index1]);
        const value2 = this.mapFn(this.heap[index2]);
        return value1 - value2;
    }

    swap(index1, index2) {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }
}

// Usage Examples:

// Using a collection of numbers
const heap1 = new MaxHeap([3, 1, 6, 5, 2, 4]);
console.assert(heap1.extractMax() === 6); // Output: 6
console.assert(heap1.peek() === 5);       // Output: 5

// Using a collection of objects with attribute mapping
const heap2 = new MaxHeap([{ score: 40 }, { score: 20 }, { score: 30 }], 'score');
console.assert(heap2.extractMax().score === 40); // Output: { score: 40 }
console.assert(heap2.peek().score === 30);       // Output: { score: 30 }

// Using a custom mapping function
const heap3 = new MaxHeap([3, 1, 6, 5, 2, 4], x => -x); // Min-heap by inverting values
console.assert(heap3.extractMax() === 1); // Output: 1 (min value due to inversion)

// Update an item
const itemToUpdate = heap2.heap.find(item => item.score === 30);
itemToUpdate.score = 50;  // Modify the item directly
heap.updateItem(itemToUpdate); // Re-adjust the heap to maintain max-heap properties
console.assert(heap.peek().score == 50); // Output: { score: 50 }