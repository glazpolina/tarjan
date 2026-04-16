export const graph_data = {
    vertices: [],
    edges: [],
    selectedVertex: null,
    selectedVertices: new Set(),
    selectedEdges: new Set(),
    draggingVertex: null,
    dragOffset: { x: 0, y: 0 },
    isSelecting: false,
    selectionStart: null,
    selectionEnd: null,
    highlightActive: false,
    componentColors: new Map(),
    showDFSLabels: false
};

export const VERTEX_RADIUS = 20;

export function clearGraph() {
    graph_data.vertices = [];
    graph_data.edges = [];
    clearSelection();
    clearHighlight();
}

function clearSelection() {
    graph_data.selectedVertex = null;
    graph_data.selectedVertices.clear();
    graph_data.selectedEdges.clear();
}

export function clearHighlight() {
    graph_data.highlightActive = false;
    graph_data.componentColors.clear();
}

export function addVertex(id, x, y) {
    graph_data.vertices.push({ id, x, y });
}

export function removeVertex(id) {
    const idx = graph_data.vertices.findIndex(v => v.id === id);
    if (idx !== -1) graph_data.vertices.splice(idx, 1);
    
    for (let i = graph_data.edges.length - 1; i >= 0; i--) {
        if (graph_data.edges[i].from === id || graph_data.edges[i].to === id) {
            graph_data.edges.splice(i, 1);
        }
    }
    graph_data.selectedVertices.delete(id);
    if (graph_data.selectedVertex === id) graph_data.selectedVertex = null;
}

export function addEdge(from, to) {
    const exists = graph_data.edges.some(e => e.from === from && e.to === to);
    if (!exists && from !== to) {
        graph_data.edges.push({ from, to });
        return true;
    }
    return false;
}

export function getNextId() {
    if (graph_data.vertices.length === 0) return 1;
    return Math.max(...graph_data.vertices.map(v => v.id)) + 1;
}

export function findVertexAt(x, y) {
    return graph_data.vertices.find(v => Math.hypot(v.x - x, v.y - y) < VERTEX_RADIUS);
}

export function findEdgeAt(x, y) {
    const nuber_of_px_to_obj = 8;
    for (let edge of graph_data.edges) {
        const from = graph_data.vertices.find(v => v.id === edge.from);
        const to = graph_data.vertices.find(v => v.id === edge.to);
        if (!from || !to) continue;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len2 = dx*dx + dy*dy;
        const t = ((x - from.x)*dx + (y - from.y)*dy) / len2;
        let proj_x, proj_y;
        if (t < 0) {
            proj_x = from.x;
            proj_y = from.y;
        } else if (t > 1) {
            proj_x = to.x;
            proj_y = to.y;
        } else {
            proj_x = from.x + t * dx;
            proj_y = from.y + t * dy;
        }
        if (Math.hypot(x - proj_x, y - proj_y) < nuber_of_px_to_obj) return edge;
    }
    return null;
}

export function saveToStorage() {
    const data = {
        vertices: graph_data.vertices,
        edges: graph_data.edges
    };
    localStorage.setItem('graph_data', JSON.stringify(data));
}

export function loadFromStorage() {
    const saved = localStorage.getItem('graph_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            graph_data.vertices = data.vertices || [];
            graph_data.edges = data.edges || [];
            clearSelection();
            clearHighlight();
        } catch (err) {
            console.warn('ошибка при загрузке графа');
        }
    }
}