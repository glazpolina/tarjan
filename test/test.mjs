function tarjan(graph) {
    const index = new Map();
    const lowlink = new Map();
    const onStack = new Map();
    const stack = [];
    let currentIndex = 0;
    const components = [];

    const adj = new Map();
    for (const v of graph.vertices) adj.set(v.id, []);
    for (const e of graph.edges) adj.get(e.from).push(e.to);

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

    for (const v of graph.vertices) {
        if (!index.has(v.id)) {
            strongConnect(v.id);
        }
    }
    return components;
}

const testGraph = {
    vertices: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 }
    ],
    edges: [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 1 },   
        { from: 3, to: 4 },
        { from: 4, to: 5 },
        { from: 5, to: 4 }    
    ]
};

console.log('Вершины:', testGraph.vertices.map(v => v.id).join(', '));
console.log('Ребра:  ', testGraph.edges.map(e => `${e.from} -> ${e.to}`).join(', '));

const components = tarjan(testGraph);

console.log('\nНайденные компоненты сильной связности:');
components.forEach((comp, idx) => {
    console.log(`  Компонента ${idx + 1}: [${comp.join(', ')}]`);
});


const test2 = {
    vertices: [{ id: 1 }, { id: 2 }],
    edges: [{ from: 1, to: 2 }]
};
console.log('\nРезультат:', tarjan(test2));
