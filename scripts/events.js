import { 
    graph_data, addVertex, removeVertex, addEdge, getNextId, 
    findVertexAt, findEdgeAt, VERTEX_RADIUS, saveToStorage, clearHighlight 
} from './graph.js';
import { draw } from './draw.js';

let canvas;
let resultDiv;

export function setupEvents(canvasEl, resultEl) {
    canvas = canvasEl;
    resultDiv = resultEl;
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', onKeyDown);
}

function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

function onMouseDown(e) {
    const { x, y } = getCoords(e);
    const vertex = findVertexAt(x, y);
    const edge = vertex ? null : findEdgeAt(x, y);

    if (e.button === 0) {
        if (e.shiftKey) {
            graph_data.isSelecting = true;
            graph_data.selectionStart = { x, y };
            graph_data.selectionEnd = { x, y };
            draw();
        } else if (vertex) {
            if (graph_data.selectedVertex !== null && graph_data.selectedVertex !== vertex.id) {
                resetHighlightIfActive();
                const ok = addEdge(graph_data.selectedVertex, vertex.id);
                showResult(ok ? `Добавлено ребро ${graph_data.selectedVertex} -> ${vertex.id}` : 'Ребро уже есть');
                graph_data.selectedVertex = null;
                draw();
                saveToStorage();
                return;
            }
            if (graph_data.selectedVertex === vertex.id) {
                graph_data.selectedVertex = null;
            } else {
                graph_data.selectedVertex = vertex.id;
            }

            if (!e.ctrlKey && !e.metaKey && graph_data.selectedVertex === null) {
                graph_data.selectedVertices.clear();
                graph_data.selectedEdges.clear();
            }
            if (graph_data.selectedVertex === null) {
                if (graph_data.selectedVertices.has(vertex.id)) {
                    graph_data.selectedVertices.delete(vertex.id);
                } else {
                    graph_data.selectedVertices.add(vertex.id);
                }
                graph_data.selectedEdges.clear();
            }
            resetHighlightIfActive();
            graph_data.draggingVertex = vertex;
            graph_data.dragOffset = { x: vertex.x - x, y: vertex.y - y };
            canvas.style.cursor = 'grabbing';
            draw();
        } else if (edge) {
            if (!e.ctrlKey && !e.metaKey) {
                graph_data.selectedVertices.clear();
                graph_data.selectedEdges.clear();
            }
            const key = `${edge.from} -> ${edge.to}`;
            if (graph_data.selectedEdges.has(key)) {
                graph_data.selectedEdges.delete(key);
            } else {
                graph_data.selectedEdges.add(key);
            }
            graph_data.selectedVertices.clear();
            graph_data.selectedVertex = null;
            draw();
        } else {
            resetHighlightIfActive();
            if (graph_data.selectedVertex !== null) {
                graph_data.selectedVertex = null;
            }
            const newId = getNextId();
            const newX = clamp(x, VERTEX_RADIUS, canvas.width - VERTEX_RADIUS);
            const newY = clamp(y, VERTEX_RADIUS, canvas.height - VERTEX_RADIUS);
            addVertex(newId, newX, newY);
            draw();
            saveToStorage();
        }
    } else if (e.button === 2 && vertex) {
        resetHighlightIfActive();
        removeVertex(vertex.id);
        draw();
        saveToStorage();
    }
}

function onMouseMove(e) {
    const { x, y } = getCoords(e);
    if (graph_data.draggingVertex) {
        let newX = x + graph_data.dragOffset.x;
        let newY = y + graph_data.dragOffset.y;
        newX = clamp(newX, VERTEX_RADIUS, canvas.width - VERTEX_RADIUS);
        newY = clamp(newY, VERTEX_RADIUS, canvas.height - VERTEX_RADIUS);
        graph_data.draggingVertex.x = newX;
        graph_data.draggingVertex.y = newY;
        draw();
    } else if (graph_data.isSelecting) {
        graph_data.selectionEnd = { x, y };
        draw();
    }
}

function onMouseUp(e) {
    if (graph_data.draggingVertex) {
        graph_data.draggingVertex = null;
        canvas.style.cursor = 'crosshair';
        saveToStorage();
    } else if (graph_data.isSelecting) {
        if (graph_data.selectionStart && graph_data.selectionEnd) {
            const s = graph_data.selectionStart;
            const e = graph_data.selectionEnd;
            if (Math.abs(s.x - e.x) > 5 || Math.abs(s.y - e.y) > 5) {
                if (!e.ctrlKey && !e.metaKey) {
                    graph_data.selectedVertices.clear();
                    graph_data.selectedEdges.clear();
                }
                const minX = Math.min(s.x, e.x);
                const maxX = Math.max(s.x, e.x);
                const minY = Math.min(s.y, e.y);
                const maxY = Math.max(s.y, e.y);
                graph_data.vertices.forEach(v => {
                    if (v.x >= minX && v.x <= maxX && v.y >= minY && v.y <= maxY) {
                        graph_data.selectedVertices.add(v.id);
                    }
                });
                graph_data.edges.forEach(edge => {
                    const from = graph_data.vertices.find(v => v.id === edge.from);
                    const to = graph_data.vertices.find(v => v.id === edge.to);
                    if (from && to) {
                        const mx = (from.x + to.x) / 2;
                        const my = (from.y + to.y) / 2;
                        if (mx >= minX && mx <= maxX && my >= minY && my <= maxY) {
                            graph_data.selectedEdges.add(`${edge.from}->${edge.to}`);
                        }
                    }
                });
            }
        }
        graph_data.isSelecting = false;
        graph_data.selectionStart = graph_data.selectionEnd = null;
        canvas.style.cursor = 'crosshair';
        draw();
    }
}

function onKeyDown(e) {
    if (e.key === 'Escape') {
        graph_data.selectedVertices.clear();
        graph_data.selectedEdges.clear();
        graph_data.selectedVertex = null;
        draw();
    } else if (e.key === 'Delete') {
        resetHighlightIfActive();
        const vCount = graph_data.selectedVertices.size;
        const eCount = graph_data.selectedEdges.size;
        if (vCount === 0 && eCount === 0) return;
        for (let id of Array.from(graph_data.selectedVertices)) {
            removeVertex(id);
        }
        for (let key of Array.from(graph_data.selectedEdges)) {
            const [from, to] = key.split('->').map(Number);
            const idx = graph_data.edges.findIndex(e => e.from === from && e.to === to);
            if (idx !== -1) graph_data.edges.splice(idx, 1);
        }
        graph_data.selectedVertices.clear();
        graph_data.selectedEdges.clear();
        graph_data.selectedVertex = null;
        draw();
        saveToStorage();
        //showResult(`Удалено ${vCount} вершин и ${eCount} рёбер`);
    } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        graph_data.selectedVertices.clear();
        graph_data.selectedEdges.clear();
        graph_data.vertices.forEach(v => graph_data.selectedVertices.add(v.id));
        graph_data.edges.forEach(e => graph_data.selectedEdges.add(`${e.from} -> ${e.to}`));
        draw();
    }
}

function resetHighlightIfActive() {
    if (graph_data.highlightActive) {
        clearHighlight();
        draw();
    }
}

function showResult(text) {
    if (resultDiv) resultDiv.textContent = text;
}

export function displayResults(components) {
    if (!resultDiv) return;
    if (components.length === 0) {
        resultDiv.textContent = 'Компонент сильной связности нет';
        return;
    }
    let html = '';
    components.forEach((comp, i) => {
        html += `Компонента ${i+1}: {${comp.join(', ')}}<br>`;
    });
    resultDiv.innerHTML = html;
}

export function clearResult() {
    if (resultDiv) resultDiv.textContent = 'Нажмите «Найти компоненты»';
}