/* #@
@name: class Polytree
@brief: a quadtree generalization
@notes: using the same concept as the quad tree, the polytree generalizes it by expanding its properties to any polygon.
The Polytree class is made of these fields:
- Polygon bounds: polygon that defines the area covered by the polytree;
- list<Point> data: list of points contained in the tree;
- int capacity: max capacity of the data list, after reaching which the tree will be split;
- bool divided: states if the tree was divided or not;
- list<Polytree> children: polytrees resulting from the splitting procedure;
- int length: number of elements in the data list;
@inputs: 
- Polygon bounds: area covered by the polytree;
- optional int capacity: capacity of the polytree, used to decide when to divide the tree.
@# */
class Polytree {
    bounds = null;
    data = [];
    capacity = 1;
    divided = false;
    children = [null, null];
    length = 0;
    constructor(bounds, capacity = 3) {
        if (capacity <= 0) throw Error(`Capacity must be a positive non zero integer, found ${capacity} instead.`);
        this.bounds = bounds;
        this.capacity = capacity;
    }

    /* #@
    @name: Polytree::draw
    @brief: draws the polytree and its children
    @notes: if the tree is not divided, draws its polygon, otherwise it draws the polygons of its children
    @inputs: 
    - optional number weight: stroke weight of the lines;
    - optional number multiplier: how much the weight of the lines changes between each "generation" of the trees (setting it to a value less than 1 will make the polygon lines thinner as divisions go on, if instead ist value is set to a number greater than 1 the lines will become thicker);
    @outputs: 
    - null.
    @# */
    draw(weight = 2, multiplier = 1) {
        if (!this.divided) this.bounds.draw(weight);
        else this.children.map((value) => { value.draw(weight * multiplier, multiplier); });
    }

    insert(value) {
        if (!this.bounds.contains(value)) return false; // the point is not in the polygon
        if (this.length == this.capacity) {
            // cannot hold any more data, give data to children
            if (!this.divided) {
                // the tree is not divided, divide it before insertion
                this.divided = this.divide();
                // the insertion failed for some reason, like for example if the cutting line coincided with an edge
                if (!this.divided) return false;
            }
            // the tree is divided
            return this.children[0].insert(value) || this.children[1].insert(value)
        } else {
            this.data.push(value);
            this.length++;
            return true;
        }
        return false; // should be unreachable
    }


    /* #@
    @name: Polytre::divide
    @brief: divides the polytree in two
    @notes: when capacity is reached, the tree is divided in two children trees
    @inputs: 
    - null;
    @outputs: 
    - null.
    @# */
    divide() {
        // find the average position of all the data
        let meanX = 0;
        let meanY = 0;
        for (let p of this.data) {
            meanX += p.x;
            meanY += p.y;
        }
        meanX /= this.data.length;
        meanY /= this.data.length;
        let angle = random() * Math.PI; // random angle
        let centroid = new Point(meanX, meanY);

        let [pol1, pol2] = this.bounds.split(centroid, angle);
        // division failed -> all the points coincide with one of the vertices of the polygon and nothing can be done about it
        if (!pol1 || !pol2) return false;
        this.children[0] = new Polytree(new Polygon(pol1, this.bounds.fillColor, this.bounds.strokeColor), this.capacity);
        this.children[1] = new Polytree(new Polygon(pol2, this.bounds.fillColor, this.bounds.strokeColor), this.capacity);
        for (let value of this.data) {
            // give data to children
            this.children[0].insert(value);
            this.children[1].insert(value);
            this.data = [];
        }
        return true;
    }

}