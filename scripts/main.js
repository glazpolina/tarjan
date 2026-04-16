import { graph_data, clearGraph, loadFromStorage, saveToStorage } from './graph.js';
import { initDraw, draw } from './draw.js';
import { setupEvents, displayResults, clearResult } from './events.js';
import { tarjan } from './tarjan.js';

const canvas = document.getElementById('graphCanvas');
const resultDiv = document.getElementById('resultArea');

initDraw(canvas);
setupEvents(canvas, resultDiv);

loadFromStorage();
draw();

document.getElementById('runBtn').addEventListener('click', () => {
    if (graph_data.vertices.length === 0) {
        resultDiv.textContent = 'Граф пуст';
        return;
    }
    const comps = tarjan();
    displayResults(comps);

    const colors = ['rgb(242, 75, 75)', 'rgb(91, 233, 91)', 'rgb(78, 78, 253)', 'rgb(248, 192, 81)', 'rgb(241, 93, 241)',
'rgb(44, 155, 219)','rgb(221, 198, 80)','rgb(230, 141, 7)','rgb(223, 23, 179)',
'rgb(220, 22, 22)','rgb(16, 119, 45)','rgb(92, 36, 182)'
    ];
    graph_data.componentColors.clear();
    for (let i = 0; i < comps.length; i++) {
        const col = colors[i % colors.length];
        const comp = comps[i];
        for (let j = 0; j < comp.length; j++) {
            graph_data.componentColors.set(comp[j], col);
        }
    }
    graph_data.highlightActive = true;
    draw();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    clearGraph();
    draw();
    clearResult();
    saveToStorage();
});

function toggleLabels() {
    graph_data.showDFSLabels = !graph_data.showDFSLabels;
    draw();
}

const toggleBtn = document.getElementById('toggleLabelsBtn');
const toggleBtnMobile = document.getElementById('toggleLabelsBtnMobile');
if (toggleBtn) toggleBtn.addEventListener('click', toggleLabels);
if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', toggleLabels);