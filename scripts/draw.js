import { graph_data, VERTEX_RADIUS } from './graph.js';

let canvas, context;

export function initDraw(canvasEl) {
    canvas = canvasEl;
    context = canvas.getContext('2d');
}

export function draw() {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (graph_data.highlightActive) {
        drawHighlighted();
        return;
    }

    if (graph_data.isSelecting && graph_data.selectionStart && graph_data.selectionEnd) {
        const s = graph_data.selectionStart;
        const e = graph_data.selectionEnd;
        context.save();
        context.fillStyle = 'rgba(0,0,255,0.1)';
        context.strokeStyle = 'rgb(0, 0, 255)';
        context.lineWidth = 1;
        context.setLineDash([4, 4]);
        context.beginPath();
        context.rect(Math.min(s.x, e.x), Math.min(s.y, e.y), Math.abs(e.x - s.x), Math.abs(e.y - s.y));
        context.fill();
        context.stroke();
        context.restore();
    }

    for (let edge of graph_data.edges) {
        const from = graph_data.vertices.find(v => v.id === edge.from);
        const to = graph_data.vertices.find(v => v.id === edge.to);
        if (!from || !to) continue;
        const isSelected = graph_data.selectedEdges.has(`${edge.from} -> ${edge.to}`);
        drawArrow(from, to, isSelected);
    }

    for (let v of graph_data.vertices) {
        const isSelected = graph_data.selectedVertices.has(v.id);
        const isStart = graph_data.selectedVertex === v.id;
        const isDragging = graph_data.draggingVertex && graph_data.draggingVertex.id === v.id;
        drawVertex(v, isSelected, isStart, isDragging);
    }
}

function drawHighlighted() {
    for (let edge of graph_data.edges) {
        const from = graph_data.vertices.find(v => v.id === edge.from);
        const to = graph_data.vertices.find(v => v.id === edge.to);
        if (from && to) drawArrow(from, to, false);
    }

    for (let v of graph_data.vertices) {
        context.beginPath();
        context.arc(v.x, v.y, VERTEX_RADIUS, 0, 2 * Math.PI);
        context.fillStyle = graph_data.componentColors.get(v.id) || 'rgb(51, 102, 255)';
        context.fill();
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.lineWidth = 2;
        context.stroke();
        context.fillStyle = 'rgb(255, 255, 255)';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(v.id, v.x, v.y);
    }
}

function drawVertex(v, selected, start, dragging) {
    context.beginPath();
    context.arc(v.x, v.y, VERTEX_RADIUS, 0, 2 * Math.PI);

    if (start) context.fillStyle = 'rgb(0, 170, 0)';
    else if (selected) context.fillStyle = 'rgb(255, 170, 0)';
    else if (dragging) context.fillStyle = 'rgb(255, 136, 0)';
    else context.fillStyle = 'rgb(51, 102, 255)';

    context.fill();
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = 'rgb(255, 255, 255)';
    context.font = 'bold 16px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(v.id, v.x, v.y);
}

function drawArrow(from, to, selected) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const startX = from.x + VERTEX_RADIUS * Math.cos(angle);
    const startY = from.y + VERTEX_RADIUS * Math.sin(angle);
    const endX = to.x - VERTEX_RADIUS * Math.cos(angle);
    const endY = to.y - VERTEX_RADIUS * Math.sin(angle);

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.strokeStyle = selected ? 'rgb(255, 0, 0)' : 'rgb(85, 85, 85)';
    context.lineWidth = selected ? 3 : 2;
    context.stroke();

    const arrowSize = 10;
    const arrowAngle = Math.PI / 6;
    const a1 = angle + Math.PI - arrowAngle;
    const a2 = angle + Math.PI + arrowAngle;
    const tipX = endX;
    const tipY = endY;
    const x1 = tipX + arrowSize * Math.cos(a1);
    const y1 = tipY + arrowSize * Math.sin(a1);
    const x2 = tipX + arrowSize * Math.cos(a2);
    const y2 = tipY + arrowSize * Math.sin(a2);

    context.beginPath();
    context.moveTo(tipX, tipY);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.fillStyle = selected ? 'rgb(255, 0, 0)' : 'rgb(85, 85, 85)';
    context.fill();
}