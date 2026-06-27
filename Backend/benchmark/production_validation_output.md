## The Bellman Ford Algorithm

**Definition:** The Bellman–Ford algorithm is used to find the shortest paths from a single source vertex to all other vertices in a weighted graph.

**Formula:**
```math
The shortest path distance to a vertex v is updated as: d(v) = min(d(v), d(u) + w(u, v))
```

The Bellman-Ford algorithm is particularly useful for graphs with negative edge weights and can detect negative weight cycles. It works by relaxing all edges repeatedly, updating the shortest path estimates until no more improvements can be made. The algorithm is capable of finding the shortest paths from a single source to all other vertices in the graph, even if some edges have negative weights. However, if there is a negative weight cycle that is reachable from the source, the algorithm can detect it, indicating that no shortest path exists for those vertices.

**Algorithm Steps:**
1. Initialize the distance to the source as 0 and all other distances as infinity.
2. Relax all edges repeatedly for V-1 times, where V is the number of vertices.
3. After V-1 iterations, check for any edges that can still be relaxed. If such an edge exists, it indicates a negative weight cycle.
4. If a negative weight cycle is detected, the algorithm can report it, indicating that no shortest path exists for those vertices.

```text
def bellman_ford(graph, source):
    distance = {node: float('inf') for node in graph}
    distance[source] = 0
    for _ in range(len(graph) - 1):
        for u, v, w in graph:
            if distance[u] + w < distance[v]:
                distance[v] = distance[u] + w
    # Check for negative weight cycles
    for u, v, w in graph:
        if distance[u] + w < distance[v]:
            distance[v] = float('inf')
    return distance
```

| col1 | col2 |
|---|---|
| Dijkstra's Algorithm | Bellman-Ford Algorithm |
| Only works with non-negative edge weights | Can handle negative edge weights |
| Uses a priority queue for efficiency | Uses a simple loop over edges |

> [!NOTE]
> **Diagram Description:** The diagram shows the step-by-step relaxation of edges in a graph, updating the shortest path estimates from the source vertex to all other vertices. Each step illustrates how the algorithm progressively finds the shortest paths by relaxing edges.

> **Example:** In a network of cities connected by roads with varying travel times, the Bellman-Ford algorithm can determine the shortest travel time from a starting city to all other cities, even if some roads have negative travel times (e.g., due to toll discounts).

> [!NOTE]
> **Memory Trick:** Remember that Bellman-Ford is named after its creators, Richard Bellman and Lester Ford, and it's often used in networking protocols like RIP.

> [!WARNING]
> **Common Mistake:** Common mistakes include forgetting to run the algorithm for V-1 iterations, not checking for negative weight cycles, and confusing it with Dijkstra's algorithm which cannot handle negative weights.

> [!TIP]
> **Exam Focus:** Remember that the Bellman-Ford algorithm can handle negative edge weights and detect negative weight cycles, which is a key distinction from Dijkstra's algorithm.

**Key Takeaways:**
- Bellman-Ford can handle negative edge weights and detect negative cycles.
- It is used in networking protocols and route optimization.
- The algorithm is slower than Dijkstra's but more versatile for certain types of graphs.



---

## Bellman-Ford Algorithm and its properties

**Definition:** An algorithm for finding the shortest paths from a single source node to all other nodes in a weighted graph, even with negative weight edges, provided there are no negative weight cycles reachable from the source.

**Formula:**
```math
The time complexity is O(V*E), where V is the number of vertices and E is the number of edges.
```

The Bellman-Ford algorithm works by relaxing all edges in the graph repeatedly. It starts by initializing the distance to the source node as 0 and all other distances as infinity. Then, it iterates over all edges for V-1 times, where V is the number of vertices, to ensure that all shortest paths are found. After these iterations, the algorithm checks for negative weight cycles by attempting to relax the edges one more time. If any distance can still be updated, it indicates the presence of a negative weight cycle.

**Algorithm Steps:**
1. Initialize the distance to the source node as 0 and all other distances as infinity.
2. Relax all edges for V-1 times, where V is the number of vertices.
3. After V-1 iterations, check if any edge can still be relaxed. If yes, there is a negative weight cycle.
4. Return the shortest path distances.

```text
def bellman_ford(graph, source):
    distance = [inf] * len(graph)
    distance[source] = 0
    for _ in range(len(graph) - 1):
        for u, v, w in graph:
            if distance[u] + w < distance[v]:
                distance[v] = distance[u] + w
    # Check for negative weight cycles
    for u, v, w in graph:
        if distance[u] + w < distance[v]:
            distance[v] = distance[u] + w
    return distance
```

| col1 | col2 |
|---|---|
| Bellman-Ford | Dijkstra's Algorithm |

> [!NOTE]
> **Diagram Description:** A diagram showing the graph with nodes and edges, and the relaxation process over multiple iterations.

> **Example:** Consider a graph with vertices A, B, C, and D. The shortest path from A to D might involve going through B and C, with a total weight of 5. The Bellman-Ford algorithm would correctly identify this path even if there are negative weight edges along the way.

> [!NOTE]
> **Memory Trick:** Remember that Bellman-Ford runs V-1 iterations and checks for negative cycles on the V-th iteration.

> [!WARNING]
> **Common Mistake:** Students often confuse Bellman-Ford with Dijkstra's algorithm, forgetting that Bellman-Ford can handle negative weights but not negative cycles.

> [!TIP]
> **Exam Focus:** Remember that Bellman-Ford can handle negative weights but not negative cycles. The key is to relax edges V-1 times and then check for any further relaxations to detect cycles.

**Key Takeaways:**
- Bellman-Ford can handle negative weights but not negative cycles.
- It runs V-1 iterations to ensure all shortest paths are found.
- A negative cycle is detected by checking if any edge can still be relaxed after V-1 iterations.

