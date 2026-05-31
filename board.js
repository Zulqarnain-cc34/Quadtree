class Point {
  constructor(x, y, data = null) {
    if (!Point.isValidCoordinate(x) || !Point.isValidCoordinate(y)) {
      throw new TypeError("Point coordinates must be finite numbers.");
    }

    this.x = x;
    this.y = y;
    this.data = data;
  }

  static isValidCoordinate(value) {
    return typeof value === "number" && Number.isFinite(value);
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    if (
      !Point.isValidCoordinate(x) ||
      !Point.isValidCoordinate(y) ||
      !Rectangle.isValidDimension(w) ||
      !Rectangle.isValidDimension(h)
    ) {
      throw new TypeError(
        "Rectangle requires finite center coordinates and positive dimensions."
      );
    }

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    if (!(point instanceof Point)) {
      throw new TypeError("Rectangle.contains expects a Point.");
    }

    return (
      // x is between x - w and x + w
      // y is between y - h and y + h 
      // and return true if both are true
      point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h
    );
  }


  intersects(rectangle) {
    if (!(rectangle instanceof Rectangle)) {
      throw new TypeError("Rectangle.intersects expects a Rectangle.");
    }

    return !(
      // rectangle is completely to the right of this rectangle
      // rectangle left edge > this right edge
      rectangle.x - rectangle.w > this.x + this.w ||

      // rectangle is completely to the left of this rectangle
      // rectangle right edge < this left edge
      rectangle.x + rectangle.w < this.x - this.w ||

      // rectangle is completely below this rectangle:
      // rectangle top edge > this bottom edge
      rectangle.y - rectangle.h > this.y + this.h ||

      // rectangle is completely above this rectangle:
      // rectangle bottom edge < this top edge
      rectangle.y + rectangle.h < this.y - this.h
    );
  }

  static isValidDimension(value) {
    return Point.isValidCoordinate(value) && value > 0;
  }
}

class QuadTree {
  constructor(boundary, capacity) {
    if (!(boundary instanceof Rectangle)) {
      throw new TypeError("QuadTree boundary must be a Rectangle.");
    }

    if (!QuadTree.isValidCapacity(capacity)) {
      throw new TypeError("QuadTree capacity must be a positive integer.");
    }

    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;

    this.northwest = null;
    this.northeast = null;
    this.southwest = null;
    this.southeast = null;
  }

  insert(point) {
    if (!(point instanceof Point)) {
      throw new TypeError("QuadTree.insert expects a Point.");
    }

    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    // If we reach this point, the capacity is reached
    // so we need to subdivide the quadtree
    if (!this.divided) {
      this.subdivide();
    }

    // Try to insert the point into the child nodes
    // and return true if the point is inserted into one of the child nodes
    return (
      this.northwest.insert(point) ||
      this.northeast.insert(point) ||
      this.southwest.insert(point) ||
      this.southeast.insert(point)
    );
  }

  subdivide() {
    if (this.divided) {
      return;
    }

    const { x, y, w, h } = this.boundary;
    const childWidth = w / 2;
    const childHeight = h / 2;

    const northwest = new Rectangle(x - childWidth, y - childHeight, childWidth, childHeight);
    const northeast = new Rectangle(x + childWidth, y - childHeight, childWidth, childHeight);
    const southwest = new Rectangle(x - childWidth, y + childHeight, childWidth, childHeight);
    const southeast = new Rectangle(x + childWidth, y + childHeight, childWidth, childHeight);

    this.northwest = new QuadTree(northwest, this.capacity);
    this.northeast = new QuadTree(northeast, this.capacity);
    this.southwest = new QuadTree(southwest, this.capacity);
    this.southeast = new QuadTree(southeast, this.capacity);
    this.divided = true;
  }

  query(searchArea, found = []) {
    if (!(searchArea instanceof Rectangle)) {
      throw new TypeError("QuadTree.query expects a Rectangle search area.");
    }

    if (!Array.isArray(found)) {
      throw new TypeError("QuadTree.query found argument must be an array.");
    }

    // First, check rectangle against rectangle:
    // if the search area does not touch this node's boundary,
    // then no point inside this node can be inside the search area.
    // Return the points we already found and skip this whole node.
    if (!this.boundary.intersects(searchArea)) {
      return found;
    }

    // Now we know the search area overlaps this node's boundary.
    // That does not mean every point in this node is inside the search area,
    // so we still check each stored point exactly.
    for (const point of this.points) {
      if (searchArea.contains(point)) {
        found.push(point);
      }
    }

    // If this node has children, repeat the same query logic in each child.
    // Children that do not intersect the search area will return immediately.
    if (this.divided) {
      this.northwest.query(searchArea, found);
      this.northeast.query(searchArea, found);
      this.southwest.query(searchArea, found);
      this.southeast.query(searchArea, found);
    }

    return found;
  }

  static isValidCapacity(value) {
    return Number.isInteger(value) && value > 0;
  }
}

if (typeof window !== "undefined") {
  window.Point = Point;
  window.Rectangle = Rectangle;
  window.QuadTree = QuadTree;
}

if (typeof module !== "undefined") {
  module.exports = { Point, Rectangle, QuadTree };
}
