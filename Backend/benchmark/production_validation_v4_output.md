## Bellman Ford Algorithm

**Definition:** An algorithm for finding the shortest paths from a single source vertex to all other vertices in a weighted graph, capable of handling negative edge weights and detecting negative weight cycles.

The Bellman-Ford algorithm operates by relaxing all edges repeatedly. It initializes distances to all vertices as infinity except the source, which is set to zero. Through V-1 iterations, it updates distances by checking if a shorter path exists. After these iterations, it checks for negative weight cycles by attempting to relax edges once more. This algorithm is particularly useful in scenarios where negative weights are present but no negative cycles exist. It is widely applied in network routing protocols and transportation systems.

**Algorithm Steps:**
1. Initialize distance to all vertices as infinity except the source, which is set to zero.
2. Relax all edges repeatedly for V-1 iterations, updating distances if a shorter path is found.
3. After V-1 iterations, perform one more relaxation step to detect any negative weight cycles.
4. If any distance is updated during this final step, a negative cycle exists.
5. Return the shortest distances from the source to all other vertices.
6. If a negative cycle is detected, the algorithm indicates that no shortest path exists for affected vertices.

```text
def bellman_ford(graph, source):
    distance = {node: float('inf') for node in graph}
    distance[source] = 0
    for _ in range(len(graph)-1):
        for u, v, w in graph:
            if distance[u] + w < distance[v]:
                distance[v] = distance[u] + w
    # Check for negative cycles
    for u, v, w in graph:
        if distance[u] + w < distance[v]:
            distance[v] = float('inf')
    return distance
```

> **Example:** In a network of cities, the Bellman-Ford algorithm helps determine the shortest path from a starting city to all other cities, even if some roads have negative weights (like discounts or toll reductions).

> [!NOTE]
> **Memory Trick:** Remember the algorithm's name as a mnemonic for 'Bellman' (for the algorithm's creator) and 'Ford' (for the company's name), and associate it with the process of relaxing edges repeatedly.

> [!WARNING]
> **Common Mistake:** Common mistakes include forgetting to run the algorithm for V-1 iterations, not checking for negative cycles, and misinterpreting the meaning of negative edge weights.

> [!TIP]
> **Exam Focus:** Focus on understanding the V-1 iteration process and how negative weight cycles are detected. Practice identifying the correct time complexity and recognizing the conditions for detecting negative cycles.

**Key Takeaways:**
- Bellman-Ford handles negative edges and detects cycles.
- It uses V-1 iterations to ensure all shortest paths are found.
- Negative cycles are detected by attempting an extra relaxation step.

