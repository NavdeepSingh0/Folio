## Bellman Ford Algorithm Overview

**Definition:** The Bellman–Ford algorithm is used to find the shortest paths from a single source vertex to all other vertices in a weighted graph.

The Bellman-Ford algorithm is particularly useful for graphs that contain negative edge weights. It can also detect the presence of negative weight cycles, where no shortest path exists. This algorithm is a dynamic programming approach that iteratively relaxes edges to find the shortest paths. It is often used in scenarios where negative weights are present, but there are no negative cycles.

**Algorithm Steps:**
1. Initialize the distance to the source vertex as 0 and all other vertices as infinity.
2. Relax all edges repeatedly for V-1 times, where V is the number of vertices.
3. Check for negative weight cycles by attempting to relax edges one more time. If any distance can still be updated, a negative weight cycle exists.

> [!NOTE]
> **Diagram Description:** The diagram shows the initialization of distances, followed by iterative relaxation steps where distances are updated based on the shortest path found.

> **Example:** In a network of cities connected by roads with varying travel times, the Bellman-Ford algorithm can determine the shortest travel time from a starting city to all other cities, even if some roads have negative travel times due to toll discounts.

> [!NOTE]
> **Memory Trick:** Think of the algorithm as a process of gradually improving the shortest path estimates, similar to how a student improves their understanding through repeated practice.

**Key Takeaways:**
- Bellman-Ford handles negative edge weights.
- It can detect negative weight cycles.
- It is a dynamic programming approach.

