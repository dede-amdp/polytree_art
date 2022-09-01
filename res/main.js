/* #@
@name: Polytree Art ~~attempt?~~
@notes: 
Generative art algorithm based on quadtree generalization that breaks polygon apart as if cracks appeared on them.

### Results Examples:
![Image 1](./readme_images/082d2863e2.png)
![Image 2](./readme_images/dbd465d1e9.png)

@# */

let seed = 0x00000000; // preset seed, change this to have different results
// notice that the images are saved with the seed, so to reproduce them just input the seed :D
let cnv, stop = true;
let polygonTypes = [3, 4, 5, 6];

// sets of colors used for the images
const colorSets = [/*[0xB9314FFF, 0x000000FF, 0xFFFFFFFF, 0x285943FF, 0xAAFCB8FF, 0x02182BFF, 0xD7263DFF],*/
    [0xE3170AFF, 0x2D1E2FFF, 0xF7B32BFF],
    [0x0A1045FF, 0xF9E900FF, 0x00C2D1FF, 0xED33B9FF],
    [0x000000FF, 0xFFFFFFFF],
    [0x204E4AFF, 0x297045FF, 0x2E933CFF, 0x81C14BFF],
    [0x0d3b66FF, 0xfaf0caFF, 0xf4d35eFF, 0xee964bFF, 0xf95738FF]];

function setup() {
    cnv = createCanvas(1080, 1080);
    frameRate(1); // increase the framerate to increase the number of generated images in a second
}

function draw() {
    random([
        generateImage,
        generateInverted,
        (seed) => {
            generateInverted(seed);
            generateImage(seed, true);
        }
    ])(seed); // choses a random function to run on each iteration
    //generateCluster(seed);
    //diffuse();
    // choose random next seed
    // remove these two lines to generate always the same result
    seed += Math.floor(random(0xFFFFFFFFFF));
    seed %= 0xFFFFFFFFFF;
    noLoop(); // remove to generate new random stuff
}

function diffuse() {
    // doesn't work as expected
    loadPixels();
    for (let x = 0; x < width * 4; x += 4) {
        for (let y = 0; y < height * 4; y += 4) {
            let index = y * width + x;
            let red = 0, green = 0, blue = 0;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy < 1; dy++) {
                    let nx = dx * 4 + x;
                    let ny = dy * 4 + y;
                    let nindex = ny * width + nx;
                    red += pixels[nindex + 0] / 9;
                    green += pixels[nindex + 1] / 9;
                    blue += pixels[nindex + 2] / 9;
                }
            }
            pixels[index + 0] = red; //red
            pixels[index + 1] = green; //green
            pixels[index + 2] = blue; //blue
        }
    }
    updatePixels();
}



function randomVertices(radius, center, n_edges) {
    let vertices = [];
    let startingRotation = random([Math.PI, Math.PI / 2, Math.PI / 4, Math.PI / 8]);
    for (let a = 0; a < Math.PI * 2; a += 2 * Math.PI / n_edges) {
        let phi = a + startingRotation;
        // get a vertex on a circumference of the specified radius at the computed angle a
        vertices.push(new Point(radius * Math.cos(-phi) + center.x, radius * Math.sin(-phi) + center.y));
    }
    return vertices;
}

function generateImage(seed, nbg = false) {
    let colorSet = random(colorSets); // chose a random set of colors
    let colors = colorSet.slice(); // copy it (it is needed later)
    // set the seed to have always the same result
    noiseSeed(seed);
    randomSeed(seed);
    console.log("seed: ", toHex(seed, 10)); // just informations

    let n_edges = random(polygonTypes);
    let radius = width / 4; // get fixed radius
    let vertices = randomVertices(radius, new Point(width / 2, height / 2), n_edges);
    let fillColor = random(colors); // choose a color and remove it from the set, so that it cannot be chosen again
    colors.splice(colors.indexOf(fillColor), 1);
    let strokeColor = random(colors); // choose a color and remove it from the set, so that it cannot be chosen again
    colors.splice(colors.indexOf(strokeColor), 1);

    let poly, polytree;
    poly = new Polygon(vertices, fillColor, strokeColor);
    polytree = new Polytree(poly);
    // insert random points in the polytree
    let i = 0;
    while (i++ < (random() * 5000) / radius + 100) {
        let x = random((-radius + width / 2), (radius + width / 2));
        let y = random((-radius + height / 2), (radius + height / 2));
        let newPoint = (new Point(x, y));
        polytree.insert(newPoint);
    }

    // drawing phase
    if (!nbg) background(toHex(random(colorSet))); //random background
    polytree.draw(random() * 3 + 1);
}

function generateInverted(seed, nbg = false) {
    let colorSet = random(colorSets); // choose a random color set
    let colors = colorSet.slice(); // copy the color set
    // set fixed seed
    noiseSeed(seed);
    randomSeed(seed);
    console.log("seed: ", toHex(seed, 10)); // just informations

    let n_edges = random(polygonTypes);
    let radius = width / 4;// get fixed radius
    let vertices = randomVertices(radius, new Point(width / 2, height / 2), n_edges);

    let fillColor = random(colors); // choose a color and remove it from the set to avoid picking it again
    colors.splice(colors.indexOf(fillColor), 1);
    let strokeColor = random(colors); // choose a color and remove it from the set to avoid picking it again
    colors.splice(colors.indexOf(strokeColor), 1);

    let poly, polytree;
    let backgroundColor = toHex(random(colorSet));
    poly = new Polygon(vertices, strokeColor, strokeColor);
    let backgr = new Polygon([
        new Point(0, 0),
        new Point(width, 0),
        new Point(width, height),
        new Point(0, height)
    ], fillColor, strokeColor);
    polytree = new Polytree(backgr); // this time the polytree is the background
    let i = 0;
    while (i++ < (random() * 5000) / radius + 100) {
        let x = random((-radius + width / 2), (radius + width / 2));
        let y = random((-radius + height / 2), (radius + height / 2));
        let newPoint = (new Point(x, y));
        polytree.insert(newPoint);
    }

    // drawing phase
    if (!nbg) background(backgroundColor); // random color
    polytree.draw(random() * 3 + 1);
    poly.draw(); // draw the polygon on top of the polytree so that it appears as if the center is not cracked
}

function generateCluster(seed, nbg = false) {
    let colorSet = random(colorSets); // get random color set
    let colors = colorSet.slice(); // copy the color set (needed later)
    // set fixed seed
    noiseSeed(seed);
    randomSeed(seed);
    console.log("seed: ", toHex(seed, 10)); // just informations

    let polytrees = []; // more than one polytree
    let centers = []; // shapes are centered in different parts of the canvas
    let radii = []; // shapes might have different radii
    let rows = 2; // number of rows
    let cols = 3; // number od columns
    let radius = random() / 2 * width / (4 * cols) + width / (4 * cols); // fixed radius that depends on the number of shapes
    // the radius can be moved inside the loop that follows to create different radii for each shape
    let fillColor = random(colors); // choose a random color an remove it from the set so that it cannot be picked again
    colors.splice(colors.indexOf(fillColor), 1);
    let strokeColor = random(colors); // choose a random color an remove it from the set so that it cannot be picked again
    colors.splice(colors.indexOf(strokeColor), 1);
    // generate all the shapes increasing by one the number of edges for each shape
    for (let i = 3; i <= 3 + rows * cols; i++) {
        // find the position in the canvas
        let dp = i - 3;
        let dy = dp % rows;
        let dx = Math.floor(dp / rows);
        let x = (width / cols) * dx + width / (rows * cols);
        let y = (height / rows) * dy + height / (rows * cols);

        let center = new Point(x, y);
        centers.push(center);
        radii.push(radius); // in case I want random radii
        let vertices = randomVertices(radius, center, i);

        let poly = new Polygon(vertices, fillColor, strokeColor);
        polytrees.push(new Polytree(poly, 4)); // create a polytree for each shape
    }

    // generate points for each shape
    //let s = 0;
    /*
    for (let polytree of polytrees) {
        let radius = radii[s];
        let center = centers[s];
        let i = 0;
        while (i++ < (random() * 5000) / radius + 100) {
            let x = random((-radius + center.x), (radius + center.x));
            let y = random((-radius + center.y), (radius + center.y));
            let newPoint = (new Point(x, y));
            polytree.insert(newPoint);
        }
        s++;
    }*/
    //alternatively
    // generate points on the entire canvas and check if they are in each polytree
    let i = 0;
    while (i++ < ((random() * 5000) + 100) * rows * cols) {
        let x = random(width);
        let y = random(height);
        let newPoint = (new Point(x, y));
        for (let polytree of polytrees) polytree.insert(newPoint);
    }

    if (!nbg) background(toHex(random(colorSet))); // random color
    for (let polytree of polytrees) {
        polytree.draw(random() * 3 + 1); // draw all the shapes
    }
}

// ignore: these functions where used to save the generated images
// these are made as a quick solution so they are not optimized nor documented
/*async function saveAll(times) {
    for (let i = 0; i < times; i++) {
        if (stop) break;
        random([
            generateImage,
            generateInverted,
            (seed) => {
                generateInverted(seed);
                generateImage(seed, true);
            }
        ])(seed);
        //generateCluster(seed);
        //diffuse();
        seed += Math.floor(Math.random() * 0xFFFFFFFFFF);
        seed %= 0xFFFFFFFFFF;
        saveCanvas(cnv, toHex(seed, 10), 'tiff');
    }
    console.log("Finished")
}*/
/*function mouseClicked() {
    stop = !stop;
    //saveAll(10);
    noLoop();
}*/