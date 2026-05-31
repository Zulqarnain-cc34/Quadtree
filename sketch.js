let tree;
const querySize = 50;

function setup() {
  createCanvas(400, 400);

  // The root boundary covers the whole canvas.
  // Rectangle uses center x/y and half-width/half-height, so:
  // center = (width / 2, height / 2)
  // half size = (width / 2, height / 2)
  const boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);

  // The quadtree starts as one big node.
  // Each node can directly hold 4 points before it subdivides into 4 children.
  tree = new QuadTree(boundary, 4);
}

function draw() {
  background(245);

  // The search area follows the mouse.
  // It is also a Rectangle: center is mouseX/mouseY, size is querySize in each direction.
  const searchArea = new Rectangle(mouseX, mouseY, querySize, querySize);

  // Ask the quadtree: which inserted points are inside this search area?
  const foundPoints = tree.query(searchArea);

  // Draw the quadtree structure first, then the query area and points on top.
  drawQuadTree(tree);
  drawSearchArea(searchArea);
  drawPoints(tree);
  drawFoundPoints(foundPoints);
  drawInstructions(foundPoints.length);
}

function mousePressed() {
  // Convert the mouse click position into a Point.
  // The quadtree decides which node should store it.
  const point = new Point(mouseX, mouseY);
  tree.insert(point);
}

function drawQuadTree(node) {
  // Draw this node's rectangle boundary.
  // The stored boundary has half-width/half-height, but p5 rect needs full size,
  // so we multiply w and h by 2.
  stroke(80);
  strokeWeight(1);
  noFill();
  rectMode(CENTER);
  rect(node.boundary.x, node.boundary.y, node.boundary.w * 2, node.boundary.h * 2);

  // If this node has subdivided, draw each child node too.
  // This recursion is what shows the full quadtree grid.
  if (node.divided) {
    drawQuadTree(node.northwest);
    drawQuadTree(node.northeast);
    drawQuadTree(node.southwest);
    drawQuadTree(node.southeast);
  }
}

function drawPoints(node) {
  // Draw the points stored directly in this node.
  noStroke();
  fill(30);

  for (const point of node.points) {
    circle(point.x, point.y, 5);
  }

  // If this node has children, their points live inside those child nodes,
  // so we recursively draw points from every child.
  if (node.divided) {
    drawPoints(node.northwest);
    drawPoints(node.northeast);
    drawPoints(node.southwest);
    drawPoints(node.southeast);
  }
}

function drawSearchArea(searchArea) {
  // Draw the mouse-following query rectangle in blue.
  // This is the area we pass into tree.query(searchArea).
  stroke(0, 120, 255);
  strokeWeight(2);
  noFill();
  rectMode(CENTER);
  rect(searchArea.x, searchArea.y, searchArea.w * 2, searchArea.h * 2);
}

function drawFoundPoints(points) {
  // Draw the query results bigger and red so they stand out from normal points.
  noStroke();
  fill(255, 80, 80);

  for (const point of points) {
    circle(point.x, point.y, 9);
  }
}

function drawInstructions(foundCount) {
  // Show quick feedback about the current query result.
  noStroke();
  fill(30);
  textSize(14);
  textAlign(LEFT, TOP);
  text(`Click to insert points. Found in blue area: ${foundCount}`, 12, 12);
}
