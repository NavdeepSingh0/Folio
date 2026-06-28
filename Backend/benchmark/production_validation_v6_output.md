## Dijkstra’s Algorithm

**Definition:** Dijkstra’s Algorithm is a greedy algorithm that finds the shortest path from a source vertex to all other vertices in a weighted graph with non-negative edge weights.

**Formula:**
$$
\text{Time Complexity} = O(E \log V)\text{ for binary heap implementation}
$$

Dijkstra’s Algorithm operates by maintaining a priority queue of vertices, where the vertex with the smallest known distance is selected at each step. It updates the shortest path estimates for adjacent vertices, ensuring that once a vertex is processed, its shortest path is finalized. This algorithm is effective for graphs with non-negative edge weights, as negative weights can invalidate the assumption that a finalized distance is the shortest. The algorithm's efficiency is O(E log V) when using a binary heap, making it suitable for large-scale network routing and pathfinding applications. It is particularly useful in scenarios like GPS navigation, where finding the shortest path is critical. The algorithm's correctness relies on the property that once a vertex is processed, its shortest path cannot be improved by subsequent updates.

**Algorithm Steps:**
1. Initialize a priority queue with the source node and set its distance to 0.
2. While the queue is not empty, extract the node with the smallest known distance.
3. For each adjacent node, calculate the tentative distance to it through the current node.
4. If the tentative distance is less than the known distance, update the distance and add the node to the queue.
5. Mark the node as processed once its shortest distance is finalized.
6. Repeat until all nodes are processed or the queue is empty.

```python
import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    heap = [(0, start)]
    while heap:
        current_dist, current = heapq.heappop(heap)
        if current_dist > distances[current]:
            continue
        for neighbor, weight in graph[current].items():
            if distances[neighbor] > distances[current] + weight:
                distances[neighbor] = distances[current] + weight
                heapq.heappush(heap, (distances[None], neighbor))
    return distances
```

**Comparison:**
| Aspect | Dijkstra | BFS | Bellman-Ford |
|---|---|---|---|
| Edge Weights | Non-negative only | Unweighted (equal) | Negative allowed |
| Time Complexity | O(E log V) | O(V + E) | O(VE) |
| Detects Negative Cycles | No | N/A | Yes |
| Use Case | General shortest path | Unweighted shortest path | Negative weights |
| Optimality Guaranteed | ✓ Yes | ✓ Yes (for equal weights) | ✓ Yes |

> **Example:** In a road network, Dijkstra’s Algorithm helps find the shortest route from a starting city to all other cities, ensuring the fastest travel time by prioritizing roads with the least distance.

> [!TIP]
> **Exam Focus:** Focus on the priority queue mechanism, the relaxation step, and the requirement for non-negative weights. Be prepared to explain the time complexity and the conditions under which the algorithm fails.

## Advanced Practice

### Conceptual Questions

**Q1:** Why does Dijkstra’s Algorithm use a priority queue instead of a regular queue for processing nodes?
> Dijkstra’s Algorithm uses a priority queue to always select the node with the smallest known distance next, ensuring that once a node is processed, its shortest path is finalized. A regular queue would process nodes in the order they were added, which could lead to suboptimal paths being finalized before shorter paths are discovered.

**Q2:** Why is the assumption of non-negative edge weights critical for Dijkstra’s Algorithm to work correctly?
> The assumption of non-negative edge weights ensures that once a node is processed, its shortest path cannot be improved by subsequent updates. If negative weights were allowed, a node could be relaxed multiple times, and the algorithm might not find the true shortest path.

**Q3:** Why does Dijkstra’s Algorithm not guarantee finding the shortest path in graphs with negative edge weights?
> Dijkstra’s Algorithm does not guarantee finding the shortest path in graphs with negative edge weights because the presence of negative weights can allow for shorter paths to be discovered even after a node has been processed. This violates the algorithm's assumption that once a node is processed, its shortest path is finalized.

### Comparison Questions

**Q1:** Under what circumstances should Dijkstra’s Algorithm be preferred over Bellman-Ford for finding shortest paths?
> Dijkstra’s Algorithm should be preferred over Bellman-Ford when the graph has non-negative edge weights, as it offers a significantly better time complexity of O(E log V) compared to Bellman-Ford’s O(VE). Additionally, Dijkstra’s Algorithm is more efficient for large-scale networks and provides faster results.

**Q2:** Under what circumstances should Dijkstra’s Algorithm be preferred over BFS for finding shortest paths?
> Dijkstra’s Algorithm should be preferred over BFS when the graph has weighted edges with non-negative weights, as BFS is only suitable for unweighted graphs. Dijkstra’s Algorithm can handle varying edge weights and find the shortest path efficiently, while BFS would not account for different weights and might return suboptimal paths.

**Q3:** Under what circumstances should Dijkstra’s Algorithm be preferred over BFS for finding shortest paths in a network with varying edge weights?
> Dijkstra’s Algorithm should be preferred over BFS in a network with varying non-negative edge weights because BFS treats all edges as having equal weight and does not account for differences in edge weights. Dijkstra’s Algorithm efficiently finds the shortest path by prioritizing nodes with smaller cumulative distances, making it suitable for weighted graphs.

### Scenario Questions

**Scenario:** A network routing system encounters a situation where the shortest path to a destination node is dynamically changing due to fluctuating link weights. Which approach do you take to ensure the algorithm adapts efficiently?
**Expected Answer:**
> Implement a dynamic version of Dijkstra’s Algorithm using a priority queue that allows for efficient updates of node distances, such as using a Fibonacci heap for improved time complexity in scenarios with frequent updates.

**Scenario:** A GPS navigation app receives real-time traffic updates that increase the weights of certain roads. How would you modify Dijkstra’s Algorithm to handle these changes without recalculating the entire path from scratch?
**Expected Answer:**
> Use a priority queue that supports decrease-key operations to update existing entries, allowing the algorithm to adapt to weight changes efficiently without reprocessing all nodes.

**Scenario:** A system requires finding the shortest path in a graph where some edges have negative weights but no negative cycles. Which variation of Dijkstra’s Algorithm would you use, and why?
**Expected Answer:**
> Use a modified version of Dijkstra’s Algorithm with a priority queue that allows for updating distances dynamically, as standard Dijkstra’s cannot handle negative weights. However, since there are no negative cycles, Bellman-Ford might be more suitable for this scenario.

### Viva Questions

**Q1:** Explain the core principle of Dijkstra’s Algorithm in less than 30 seconds.
> Dijkstra’s Algorithm finds the shortest path from a source node to all others in a graph with non-negative weights by using a priority queue to always expand the node with the smallest known distance.

**Q2:** Why is Dijkstra’s Algorithm not suitable for graphs with negative edge weights?
> Dijkstra’s Algorithm assumes non-negative weights, as negative weights can lead to shorter paths being discovered after a node is processed, invalidating the final distance calculation.

**Q3:** How does Dijkstra’s Algorithm differ from BFS in terms of handling edge weights?
> Dijkstra’s Algorithm uses a priority queue to handle weighted edges efficiently, while BFS treats all edges as equal weight and processes nodes level by level, making it unsuitable for weighted graphs.

### Coding Challenges

**Challenge:** Implement Dijkstra’s Algorithm with a priority queue and analyze its time complexity for a graph with V vertices and E edges.
*(Expected Topics: dijkstra’s-algorithm)*

**Challenge:** Modify the existing Dijkstra’s Algorithm implementation to handle a graph with multiple disconnected components and explain how the algorithm adapts.
*(Expected Topics: dijkstra’s-algorithm)*

**Challenge:** Implement Dijkstra’s Algorithm using a Fibonacci heap instead of a binary heap and analyze how this affects the time complexity.
*(Expected Topics: dijkstra’s-algorithm)*

### Exam Predictions

**[10 Marks]** Design an algorithm to find the shortest path from a source to all other nodes in a weighted graph with non-negative edge weights, and explain why Dijkstra’s Algorithm is suitable for this task. Include a discussion on its time complexity and the conditions under which it fails.
**Marking Scheme:**
  - 2 marks for defining Dijkstra’s Algorithm
  - 2 marks for explaining its suitability
  - 2 marks for time complexity
  - 2 marks for conditions of failure
  - 2 marks for overall explanation

**[10 Marks]** Compare and contrast Dijkstra’s Algorithm with Bellman-Ford in terms of time complexity, edge weight requirements, and use cases. Provide an example scenario where each algorithm would be most appropriate.
**Marking Scheme:**
  - 3 marks for time complexity comparison
  - 3 marks for edge weight requirements
  - 3 marks for use case examples
  - 1 mark for overall clarity

**[10 Marks]** Explain how Dijkstra’s Algorithm ensures that once a node is processed, its shortest path is finalized. Discuss the implications of this property on the algorithm’s correctness and efficiency.
**Marking Scheme:**
  - 3 marks for explaining the finalization process
  - 3 marks for correctness implications
  - 3 marks for efficiency implications
  - 1 mark for overall clarity

