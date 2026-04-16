import { graph_data } from './graph.js';

export function tarjan() {
    const adj = new Map();
    for (const vertex of graph_data.vertices) {
        adj.set(vertex.id, []);
    }
    for (const edge of graph_data.edges) {
        const list = adj.get(edge.from);
        if (list) list.push(edge.to);
    }

    const index = new Map();
    const lowlink = new Map();
    const onStack = new Map();
    const stack = [];
    let currentIndex = 0;
    const components = [];

    function strongConnect(v) {
        index.set(v, currentIndex);
        lowlink.set(v, currentIndex);
        currentIndex++;
        stack.push(v);
        onStack.set(v, true);

        const neighbors = adj.get(v) || [];
        for (const w of neighbors) {
            if (!index.has(w)) {
                strongConnect(w);
                lowlink.set(v, Math.min(lowlink.get(v), lowlink.get(w)));
            } else if (onStack.get(w)) {
                lowlink.set(v, Math.min(lowlink.get(v), index.get(w)));
            }
        }

        if (lowlink.get(v) === index.get(v)) {
            const comp = [];
            const startIdx = stack.findIndex(id => id === v);
            const part = stack.splice(startIdx);
            for (const id of part) {
                onStack.set(id, false);
                comp.push(id);
            }
            components.push(comp);
        }
    }

    for (const vertex of graph_data.vertices) {
        if (!index.has(vertex.id)) {
            strongConnect(vertex.id);
        }
    }

    for (const vertex of graph_data.vertices) {
        vertex.index = index.get(vertex.id);
        vertex.lowlink = lowlink.get(vertex.id);
    }

    return components;
}