## Bellman Ford Algorithm

**Definition:** An algorithm for finding the shortest paths from a single source vertex to all other vertices in a weighted graph, capable of handling negative edge weights and detecting negative weight cycles.

**Formula:**
$$
\text{Time Complexity} = O(VE)\
$$

The Bellman-Ford algorithm operates by iteratively relaxing edges to find the shortest paths. It initializes distances to all vertices as infinity except the source, which is set to zero. Through V-1 iterations, it updates distances by checking if a shorter path exists through each edge. After these iterations, if further relaxation is possible, it indicates the presence of a negative weight cycle. This algorithm is particularly useful in scenarios where negative weights are present, unlike Dijkstra's algorithm. Its ability to detect negative cycles makes it valuable in network routing and other applications requiring robust shortest path calculations.

**Algorithm Steps:**
1. Initialize distance to source as 0 and all others as infinity
2. Relax all edges V-1 times
3. Check for negative cycles by relaxing edges once more
4. If any distance can still be updated, a negative cycle exists

```python
def bellman_ford(graph, source):
    distances = {node: float('inf') for node in graph}
    distances[source] = 0
    for _ in range(len(graph)-1):
        for u, v, w in graph:
            if distances[u] + w < distances[v]:
                distances[v] = distances[u] + w
    # Check for negative cycles
    for u, v, w in graph:
        if distances[u] + w < distances[v]:
            distances[v] = float('inf')
    return distances
```

| col1 | col2 |
|---|---|
| Dijkstra's Algorithm | Bellman-Ford Algorithm |
| Requires non-negative edge weights | Handles negative edge weights |
| Uses a priority queue | Uses a queue for edge relaxation |

> [!NOTE]
> **Diagram Description:** A diagram illustrating the relaxation process, showing how distances to nodes are updated through successive iterations.

> **Example:** In a network of cities connected by roads with varying travel times, Bellman-Ford can determine the shortest travel time from a starting city to all other cities, even if some roads have negative weight (e.g., toll discounts).

> [!NOTE]
> **Memory Trick:** Remember B-F as 'Bellman Ford' - think of 'Bell' for the initial zero distance and 'Ford' for the final relaxation step detecting cycles.

> [!WARNING]
> **Common Mistake:** Commonly confusing the number of iterations with the number of edges, leading to incorrect cycle detection.

> [!TIP]
> **Exam Focus:** Focus on understanding how the algorithm detects negative cycles through V-th iteration relaxation and the time complexity of O(VE).

**Key Takeaways:**
- Bellman-Ford handles negative edges and detects cycles
- Time complexity is O(VE) for standard implementation
- Relaxation process is central to finding shortest paths

