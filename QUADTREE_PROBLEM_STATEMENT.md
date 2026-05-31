# Quadtree Problem Statement and Algorithm

## Problem Statement

Build a quadtree-based spatial partitioning system for a 2D canvas. The system should store points or objects by position and make spatial queries faster than checking every object one by one.

This project uses a p5.js canvas, so the quadtree should support real-time drawing, insertion, subdivision, and range queries inside the visible canvas area.

## Goal

The goal is to organize 2D points into a tree of rectangular regions. Each region stores a limited number of points. When a region becomes too crowded, it splits into four smaller regions:

- northwest
- northeast
- southwest
- southeast

This makes it efficient to search only the parts of the canvas that can contain relevant points.

## Why a Quadtree Is Needed

Without a quadtree, searching nearby points requires scanning every point:

```text
for every point:
  check if the point is inside the query area
```

That approach becomes slow as the number of points grows.

A quadtree reduces unnecessary checks by ignoring regions that do not intersect the query area.

## Core Concepts

### Point

A point represents an object placed on the canvas.

Expected data:

```text
x: horizontal position
y: vertical position
data: optional payload, such as color, id, velocity, or object metadata
```

### Rectangle Boundary

Each quadtree node owns a rectangular boundary.

Expected data:

```text
x: center x position
y: center y position
w: half width
h: half height
```

The rectangle should provide:

- `contains(point)`: returns true when a point is inside the rectangle.
- `intersects(range)`: returns true when two rectangles overlap.

### Quadtree Node

Each node stores:

```text
boundary: rectangle area owned by this node
capacity: maximum number of points before subdivision
points: points stored directly in this node
divided: whether this node has child nodes
children: northwest, northeast, southwest, southeast
```

## Algorithm

### Insert a Point

1. Validate that the point has numeric `x` and `y` values.
2. If the point is outside the current node boundary, reject it.
3. If the node still has available capacity, store the point in this node.
4. If the node is full and has not been divided yet, subdivide it into four child nodes.
5. Try inserting the point into one of the four child nodes.
6. Return whether the insert succeeded.

Pseudocode:

```text
insert(point):
  if boundary does not contain point:
    return false

  if points.length < capacity:
    points.add(point)
    return true

  if not divided:
    subdivide()

  return northwest.insert(point)
      or northeast.insert(point)
      or southwest.insert(point)
      or southeast.insert(point)
```

### Subdivide a Node

When a node exceeds its capacity, split its boundary into four equal rectangles.

For a parent boundary:

```text
center: (x, y)
half size: (w, h)
```

Create children:

```text
northwest: center (x - w / 2, y - h / 2), half size (w / 2, h / 2)
northeast: center (x + w / 2, y - h / 2), half size (w / 2, h / 2)
southwest: center (x - w / 2, y + h / 2), half size (w / 2, h / 2)
southeast: center (x + w / 2, y + h / 2), half size (w / 2, h / 2)
```

After subdivision, new points should be inserted into the appropriate child node.

### Query a Range

The query operation returns all points inside a given rectangular range.

1. Validate the query range.
2. If the query range does not intersect the node boundary, stop searching this node.
3. Check each point stored directly in this node.
4. If a point is inside the query range, add it to the result list.
5. If the node has children, query each child.
6. Return all matching points.

Pseudocode:

```text
query(range, found):
  if range does not intersect boundary:
    return found

  for each point in points:
    if range contains point:
      found.add(point)

  if divided:
    northwest.query(range, found)
    northeast.query(range, found)
    southwest.query(range, found)
    southeast.query(range, found)

  return found
```

## Expected Behavior

- Points outside the canvas boundary should not be inserted.
- Points inside the canvas boundary should be inserted exactly once.
- Nodes should subdivide only when capacity is reached.
- Queries should return only points inside the query rectangle.
- Empty regions should be skipped during queries.
- Drawing the quadtree should show the recursive rectangular regions.

## Edge Cases

- A point lies exactly on a boundary line.
- A point is outside the canvas.
- A query range is completely outside the canvas.
- A query range overlaps only part of the canvas.
- Many points are inserted at the same or nearly same position.
- Capacity is zero or invalid.
- Input values are missing, non-numeric, `NaN`, or infinite.

## Validation Rules

- Canvas width and height must be positive numbers.
- Quadtree capacity must be a positive integer.
- Point coordinates must be finite numbers.
- Rectangle dimensions must be finite positive numbers.
- Query ranges must use the same rectangle format as node boundaries.

## Suggested p5.js Interaction

- Create the root quadtree using the full canvas boundary.
- Insert random points, mouse-clicked points, or moving particles.
- Draw every quadtree boundary as a thin rectangle.
- Draw points as small circles.
- Use the mouse position as the center of a query range.
- Highlight queried points with a different color.

## Testing Scenarios

1. Insert one point and confirm it appears in the root node.
2. Insert points up to capacity and confirm no subdivision happens early.
3. Insert one more point than capacity and confirm subdivision happens.
4. Query a small range and confirm only points inside that range are returned.
5. Query outside the canvas and confirm the result is empty.
6. Insert invalid point data and confirm it is rejected safely.
7. Insert many points and confirm rendering still works smoothly.

## Acceptance Criteria

The quadtree implementation is complete when:

- It provides reusable `Point`, `Rectangle`, and `QuadTree` structures.
- It validates input before insertion and querying.
- It supports point insertion, node subdivision, and range querying.
- It can be visualized on the p5.js canvas.
- It handles invalid input and boundary cases without crashing.
- It improves query behavior by checking only relevant regions.
