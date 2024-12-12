/*
Camilo andres de la puente romero: 0221920013
Ronaldo jimenez guerrero: 0221920028
Brayhan David herazo: 0222010021

*/

const canvas = document.getElementById('canvas');  // manipulacion del lienzo
const ctx = canvas.getContext('2d');              // se utiliza para realizar operaciones de dibujo

let nodes = []; //arreglo de nodos
let edges = [];//arreglo de aristas
let nodeCounter = 1;//contador de nodos

let lost = []; //arreglo para guardar nombres de nodos 
let cEracer = 0; let cRename = 0; let save = 1;//contadores extras

// Variable para rastrear si se está arrastrando
let draggingNode = null;
let offsetX, offsetY;

// variables para cronometro
let startTime;
let endTime;

// Contadores de nodo iniciale y final
let nodosFinales = 0;
let nodosIniciale = 0;
let counter;



const graph = {};//representar la estructura del grafo

canvas.addEventListener('dblclick', function (event) {//1) tomar las cordenadas x y y para los nodos
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  addNode(x, y);//
});

function addNode(x, y) {//2) agregar nodo
  let node = { name: nodeCounter, x: x, y: y, color: '#ffcc00', type: "normal" };



  if (nodes.length <= 1) {


    if (nodes.length === 0) { nodosIniciale++; node.name = "I" + nodosIniciale; node.type = "Inicial"; }
    else { nodosFinales++; node.name = "F" + nodosFinales; node.type = "Final"; }

    node.color = '#1900ff';
    nodeCounter--;


  }

  if (cEracer > 0 && cRename < cEracer) {//heredado de nombres
    node.name = lost[cRename];
    lost[cRename] = 0;
    cRename++;

    if (node.name === "I") {
      node.type = "Inicial";
      node.color = '#1900ff';

      // Intercambiar con el nodo en la posición 0
      let tempNode = nodes[0];
      nodes[0] = node;
      node = tempNode;

      drawNodes();
    } else if (node.name === "F") {
      node.type = "Final";
      node.color = '#1900ff';

      // Intercambiar con el nodo en la posición 1
      let tempNode = nodes[1];
      nodes[1] = node;
      node = tempNode;
      drawNodes();
    }


  } else {
    nodeCounter++;
  }

  nodes.push(node);

  drawNode(node, node.color);
  updateSelects();
}

function drawNodes() {//3) redibujar todos los nodos
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const node of nodes) {
    drawNode(node, node.color);
  }
  drawEdges();
}

function drawNode(node, color) {//4) dibujar nodos
  ctx.beginPath();
  ctx.arc(node.x, node.y, 18, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.font = "12px Arial";
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText("n" + node.name, node.x, node.y + 3);
}

function deleteNode() {//5) borrar nodos y sus aristas
  let deleteNode = parseInt(document.getElementById('editNode').value);
  if (!deleteNode) { deleteNode = document.getElementById('editNode').value; }


  nodes = nodes.filter((node) => node.name !== deleteNode);
  edges = edges.filter((edge) => edge.start !== deleteNode && edge.end !== deleteNode);
  drawNodes();
  updateSelects();

  let controlador = true;

  for (let x = nodosIniciale; x > 0; x--) {
    if (deleteNode === "I" || deleteNode === "I" + x) { controlador = false; nodosIniciale--; }
  }
  for (let x = nodosFinales; x > 0; x--) {
    if (deleteNode === "F" || deleteNode === "F" + x) { controlador = false; nodosFinales--; }
  }

  if (controlador) {

    if (nodes.length == 0) {//guardado de difuntos
      nodeCounter = 1;
      cEracer = 0
    } else {
      lost[cEracer] = deleteNode;
      cEracer++;
    }

  }


  lost.sort(function (a, b) { return a - b; });
}

function ChangeNodeInicial() {//Cambiar al nodo Inicial
  let ChangeNode = parseInt(document.getElementById('editNode').value);
  if (!ChangeNode) { ChangeNode = document.getElementById('editNode').value; }

  let selectedNode = nodes.find((node) => node.name === ChangeNode);


  if (selectedNode.type === "Inicial") {

    alert("El nodo selecionado ya es un nodo Inicial")

  } else {



    let name = selectedNode.name;

    nodosIniciale++;

    nodeCounter--;

    selectedNode.type = "Inicial";
    selectedNode.name = "I" + nodosIniciale;
    selectedNode.color = '#1900ff';

    if (nodes.length == 0) {//guardado de difuntos
      nodeCounter = 1;
      cEracer = 0
    } else {
      lost[cEracer] = name;
      cEracer++;
      nodeCounter++;
    }

    for (let x = 0; x < edges.length; x++) {


      if (edges[x].start === name) { edges[x].start = selectedNode.name }
      else if (edges[x].end === name) { edges[x].end = selectedNode.name }
    }



    updateSelects();
    drawNodes();
  }
}

function ChangeNodeFinal() {//Cambiar al nodo final
  let ChangeNode = parseInt(document.getElementById('editNode').value);
  if (!ChangeNode) { ChangeNode = document.getElementById('editNode').value; }

  let selectedNode = nodes.find((node) => node.name === ChangeNode);


  if (selectedNode.type === "Final") {

    alert("El nodo selecionado ya es un nodo final")

  } else {

    let name = selectedNode.name;

    nodosFinales++;
    nodeCounter--;

    selectedNode.type = "Final";
    selectedNode.name = "F" + nodosFinales;
    selectedNode.color = '#1900ff';

    if (nodes.length == 0) {//guardado de difuntos
      nodeCounter = 1;
      cEracer = 0
    } else {
      lost[cEracer] = name;
      cEracer++;

      nodeCounter++;

    }

    for (let x = 0; x < edges.length; x++) {

      if (edges[x].start === name) { edges[x].start = selectedNode.name }
      else if (edges[x].end === name) { edges[x].end = selectedNode.name }
    }

    drawNodes();
    updateSelects();
  }

}

function addEdge() {//7) agregar aristas
  const startNodeValue = document.getElementById('startNode').value
  const endNodeValue = document.getElementById('endNode').value;
  const edgeValue = parseInt(document.getElementById('edgeValue').value);

  if (isNaN(edgeValue) || edgeValue === 0) {
    const confirmed = confirm('No se ha establecido un valor válido para la arista.');
    if (confirmed) {

    }
  } else {
    let startNodeIndex = parseInt(startNodeValue);
    if (!startNodeIndex) { startNodeIndex = startNodeValue }

    let endNodeIndex = parseInt(endNodeValue);
    if (!endNodeIndex) { endNodeIndex = endNodeValue }

    const edge = { start: startNodeIndex, end: endNodeIndex, value: edgeValue, color: '#000000' }

    edges.push(edge);


    let startNode = nodes.find(node => node.name === startNodeIndex);
    let endNode = nodes.find(node => node.name === endNodeIndex);




    drawEdge(startNode.x, startNode.y, endNode.x, endNode.y, edgeValue, edge.color);
    updateSelects();
  }
}

function drawEdge(startX, startY, endX, endY, value, color) {//8)dibujar aristas 
  const startRadius = 18;
  const endRadius = 18;

  // Calcular de las medidas de la arista
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);

  const startArrowX = startX + (dx * startRadius) / length;
  const startArrowY = startY + (dy * startRadius) / length;
  const endArrowX = endX - (dx * endRadius) / length;
  const endArrowY = endY - (dy * endRadius) / length;

  // Dibujar la línea
  ctx.beginPath();
  ctx.moveTo(startArrowX, startArrowY);
  ctx.lineTo(endArrowX, endArrowY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dibujar la flecha
  const arrowSize = 8;
  const angle = Math.atan2(endArrowY - startArrowY, endArrowX - startArrowX);
  const arrowStartX = endArrowX - Math.cos(angle) * arrowSize;
  const arrowStartY = endArrowY - Math.sin(angle) * arrowSize;

  ctx.beginPath();
  ctx.moveTo(endArrowX, endArrowY);
  ctx.lineTo(
    arrowStartX - Math.cos(angle - Math.PI / 6) * arrowSize,
    arrowStartY - Math.sin(angle - Math.PI / 6) * arrowSize
  );
  ctx.moveTo(endArrowX, endArrowY);
  ctx.lineTo(
    arrowStartX - Math.cos(angle + Math.PI / 6) * arrowSize,
    arrowStartY - Math.sin(angle + Math.PI / 6) * arrowSize
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dibujar el valor 
  const labelX = (startArrowX + endArrowX) / 2.09;
  const labelY = (startArrowY + endArrowY) / 2.09;

  ctx.font = '15px Arial';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';


  if (value == 0) {
    ctx.font = '26px Arial';
    ctx.fillText("∞", labelX, labelY);
  } else {
    ctx.fillText(value.toString(), labelX, labelY);
  }

}

function drawEdges() {//9) redibujara aristas
  for (const edge of edges) {
    const startNode = nodes.find(node => node.name === edge.start);
    const endNode = nodes.find(node => node.name === edge.end);
    drawEdge(startNode.x, startNode.y, endNode.x, endNode.y, edge.value, edge.color);
  }
}

function deleteEdge() {//10) borrar una arista en especifico
  const deleteEdgeIndex = parseInt(document.getElementById('editEdge').value);

  edges.splice(deleteEdgeIndex, 1);


  drawNodes();
  updateSelects();
}

function changeEdgeValue() {//11) cambiar el valor de las aristas
  save = 0
  const changeEdgeIndex = parseInt(document.getElementById('editEdge').value);
  const newValue = parseInt(document.getElementById('newValue').value);
  edges[changeEdgeIndex].value = newValue;
  drawNodes();
}

function updateSelects() {//12) actualizacion de los datos de los select
  save = 0;
  // select de nodos
  const startNodeSelect = document.getElementById('startNode');
  const endNodeSelect = document.getElementById('endNode');
  const editNodeSelect = document.getElementById('editNode');
  // select de aristas
  const editEdgeSelect = document.getElementById('editEdge');

  editNodeSelect.innerHTML = '';
  startNodeSelect.innerHTML = '';
  endNodeSelect.innerHTML = '';
  editEdgeSelect.innerHTML = '';

  // Agregar nodos al select


  for (const node of nodes) {
    const option = document.createElement('option');
    option.value = node.name;
    option.text = `Nodo ${node.name}`;
    startNodeSelect.add(option);

    const option2 = document.createElement('option');
    option2.value = node.name;
    option2.text = `Nodo ${node.name}`;
    endNodeSelect.add(option2);

    const option3 = document.createElement('option');
    option3.value = node.name;
    option3.text = `Nodo ${node.name}`;
    editNodeSelect.add(option3);
  }

  // Agregar aristas al select
  for (const edge of edges) {
    const option = document.createElement('option');
    option.value = edges.indexOf(edge);
    option.text = `Arista ${edge.start} - ${edge.end}`;
    editEdgeSelect.add(option);
  }
}

function newProject() {//13) borrar todo 

  if (save == 0) {
    const confirmed = confirm('Aun hay cambios sin guardar ¿Desea continuar?');

    if (confirmed) {
      nodes = [];
      edges = [];
      lost = [];
      updateSelects();
      nodeCounter = 1;
      cEracer = 0; cRename = 0; save = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    nodes = [];
    edges = [];
    lost = [];
    updateSelects();
    nodeCounter = 1;
    cEracer = 0; cRename = 0; save = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  save = 1
}

function saveProject() {//14)  Guardar el proyecto
  const data = JSON.stringify({ nodes: nodes, edges: edges });
  const blob = new Blob([data], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(blob);

  // Guardar el archivo JSON
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = 'Grafo.json';
  jsonLink.click();
  URL.revokeObjectURL(jsonUrl);

  save = 1;
}

function saveImg() {//15)  Guardar como imagen
  const canvasImage = document.createElement('canvas');
  canvasImage.width = canvas.width;
  canvasImage.height = canvas.height;
  const ctxImage = canvasImage.getContext('2d');

  // Dibujar el fondo blanco en el lienzo de imagen
  ctxImage.fillStyle = '#ffffff';
  ctxImage.fillRect(0, 0, canvasImage.width, canvasImage.height);

  // Dibujar la imagen del lienzo original en el lienzo de imagen
  ctxImage.drawImage(canvas, 0, 0);

  canvasImage.toBlob(function (blob) {
    const imageUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'Grafo.png';
    link.click();

    URL.revokeObjectURL(imageUrl);
  }, 'image/png');
}

function openProject() {//16) abrir proyecto desde archivo JSON
  const input = document.createElement('input');

  nodosFinales = 0;
  nodosIniciale = 0;

  input.type = 'file';
  input.accept = 'application/json';
  input.click();

  input.onchange = function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function (event) {
      const data = JSON.parse(event.target.result);
      nodes = data.nodes;
      edges = data.edges;

      let max = 0;
      for (const node of nodes) {
        if (node.name > max) {
          max = node.name;
        }
      }

      nodeCounter = max + 1;

      for (let x = 0; x < nodes.length; x++) {
        if (nodes[x].type === "Inicial") { nodosIniciale++; }
        if (nodes[x].type === "Final") { nodosFinales++; }
      }

      //test()
      drawNodes();
      updateSelects();

    };

  };

}

//___________________________________________________________________________________________________________________________________

function startDraggingNode(node, x, y) {//Ajusta el nodo que se está arrastrando y calcula las diferencias de posición
  draggingNode = node;
  offsetX = x - node.x;
  offsetY = y - node.y;
}

function stopDraggingNode() {//Detiene el arrastre de un nodo
  draggingNode = null;
}

canvas.addEventListener('mousedown', function (event) {//evento que Inicia el arrastre de un nodo
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  for (const node of nodes) {
    const distance = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
    if (distance <= 18) {
      startDraggingNode(node, mouseX, mouseY);
      break;
    }
  }
});

canvas.addEventListener('mousemove', function (event) {//evento que escucha el arrastre y va Actualiza la posicion del nodo
  if (draggingNode) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    draggingNode.x = mouseX - offsetX;
    draggingNode.y = mouseY - offsetY;

    drawNodes();
  }
});

canvas.addEventListener('mouseup', function () {//evento que escucha donde se finaliza el arrastre
  stopDraggingNode();
});

//___________________________________________________________________________________________________________________________________

function dijkstra(startNodeName) {//algotimo de distrak

  const distances = {};
  const visited = {};
  const queue = [];

  // Inicializar las distancias y la cola de prioridad
  for (const node of nodes) {
    distances[node.name] = Infinity;
    visited[node.name] = false;
    queue.push(node.name);
  }

  distances[startNodeName] = 0;

  while (queue.length > 0) {
    // Ordenar la cola por distancia
    queue.sort((a, b) => distances[a] - distances[b]);

    const currentNodeName = queue.shift();
    const currentNode = nodes.find(node => node.name === currentNodeName);

    // Marcar el nodo como visitado
    visited[currentNodeName] = true;

    for (const edge of edges) {
      if (edge.start === currentNodeName && !visited[edge.end]) {
        const newDistance = distances[currentNodeName] + edge.value;

        if (newDistance < distances[edge.end]) {
          distances[edge.end] = newDistance;
        }
      }
    }
  }

  return distances;
}

function findShortestPath() {// Función para encontrar el camino más corto entre el nodo inicial y final

  startTime = performance.now();//inicio del cronometro

  const startNode = nodes[0];
  const endNode = nodes[1];

  // Función dijkstra implementada anteriormente
  const distances = dijkstra(startNode.name);

  if (distances[endNode.name] === Infinity) {
    alert('No hay un camino válido desde el nodo inicial al nodo final.');
    return null;
  }

  // Reconstruir el camino más corto
  let currentNode = endNode;
  const shortestPath = [currentNode];

  while (currentNode.name !== startNode.name) {
    const incomingEdge = edges.find(edge => edge.end === currentNode.name && distances[edge.start] === distances[currentNode.name] - edge.value);
    const previousNode = nodes.find(node => node.name === incomingEdge.start);
    shortestPath.unshift(previousNode);
    currentNode = previousNode;
  }

  endTime = performance.now();//final del cronometro



  return shortestPath;
}

function EjecucionDijkstra() {// Uso de la función 
  if (!Verificacion()) {
    alert('El grafo no es válido para la operación.');
    return;
  }
  if (nodosFinales>1 || nodosIniciale>1) {
    alert('El grafo debe ser unico origen, unico destino para realizar la operacion.');
    return;
  }


  const camino = findShortestPath();

  // Verificar si no se encontró un camino
  if (camino === null) {
    return;
  }

  console.log("Camino más corto:", camino);

  for (let x = 0; x < nodes.length; x++) {//cambio de color de los nodos
    let controlador = false;

    for (let y = 0; y < camino.length; y++) {

      if (nodes[x] === camino[y]) {
        controlador = true;

        if (nodes[x].type != "Inicial" && nodes[x].type != "Final") {
          nodes[x].color = '#ffcc00'
        }
      }
    }

    if (controlador === false) { nodes[x].color = '#676769' }

  }

  for (let x = 0; x < edges.length; x++) {//cambio de color de los aristas


    for (let y = 0; y < camino.length; y++) {

      if (edges[x].start === camino[y].name && edges[x].end === camino[y + 1].name) {

        edges[x].color = '#111111'
      }
    }

    if (edges[x].color === '#111111') { edges[x].color = '#000000' }
    else { edges[x].color = '#a1a1a3' }

  }



  time(endTime - startTime);

}

//_______________________________________________________________________________________________________________________________

function fordFulkerson(graph, Inicio, Final) {//Algoritmo ford Fulkerson

  startTime = performance.now();
  let flujoMaximo = 0;

  function encontrarFlujo(grafico, Inicio, Final, padre) {
    const visitados = new Set();

    const dfs = (actual) => {
      visitados.add(actual);

      for (const vecino in grafico[actual]) {
        if (!visitados.has(vecino) && grafico[actual][vecino].capacity > 0) {
          padre[vecino] = actual;

          if (vecino === Final) {
            return true;
          }

          if (dfs(vecino)) {
            return true;
          }
        }
      }

      return false;
    };

    return dfs(Inicio);
  }

  let padre = {};
  Object.keys(graph).forEach((nodo) => {
    padre[nodo] = null;
  });

  while (encontrarFlujo(graph, Inicio, Final, padre)) {
    let flujoCamino = Infinity;

    for (let v = Final; v !== Inicio; v = padre[v]) {
      const u = padre[v];
      flujoCamino = Math.min(flujoCamino, graph[u][v].capacity);
    }

    for (let v = Final; v !== Inicio; v = padre[v]) {
      const u = padre[v];
      graph[u][v].capacity -= flujoCamino;
      graph[v][u].capacity += flujoCamino;
      graph[u][v].used = true;
    }

    flujoMaximo += flujoCamino;

    Object.keys(padre).forEach((nodo) => {
      padre[nodo] = null;
    });
  }

  endTime = performance.now();
  return flujoMaximo;
}

function Camino(graph) {//Busca las aristas que conforman el camino del flujo maximo
  const aristasFlujoMaximo = [];

  edges.forEach((edge) => {
    const { start, end } = edge;
    if (graph[start][end].used) {
      aristasFlujoMaximo.push(edge);
    }
  });

  return aristasFlujoMaximo;
}

function EjecucionFulkerson() {//ejecucion del Algoritmo ford Fulkerson
  if (!Verificacion()) {
    alert('El grafo no es válido para la operación.');
    return;
  }

  let sourceNode = 'I1';
  let sinkNode = 'F1';


  if (nodosIniciale > 1) {// si hay mas de un nodo inicial

    const node = { name: "X", x: 50, y: 300, color: '#ff0000', type: "Origen" };
    nodes.push(node);

    for (let x = 0; x < nodes.length; x++) {

      if (nodes[x].type === "Inicial") {
        const edge = { start: "X", end: nodes[x].name, value: Infinity, color: '#000000' }
        edges.push(edge);
      }
    }
    sourceNode = "X";
  }

  if (nodosFinales > 1) {// si hay mas de un nodo Final

    let node = { name: "Y", x: 900, y: 300, color: '#ff0000', type: "Destino" };
    nodes.push(node);

    for (let x = 0; x < nodes.length; x++) {
      if (nodes[x].type === "Final") {
    
        const edge = { start: nodes[x].name, end: "Y", value: Infinity, color: '#000000' }
        edges.push(edge);

      }
    }

    nodes[nodes.length-1].type="Final";
    sinkNode="Y";
  }

  const graph = {};
  nodes.forEach((node) => {
    graph[node.name] = {};
  });
  edges.forEach((edge) => {
    const { start, end, value } = edge;
    graph[start][end] = { capacity: value, used: false };
    graph[end][start] = { capacity: value, used: false };
  });

  const maxFlow = fordFulkerson(graph, sourceNode, sinkNode);
  console.log("Flujo Máximo:", maxFlow);

  const aristas = Camino(graph);

  function eliminarNodosOrigenDestino() {
    // Eliminar el nodo "X"
    const indexNodoX = nodes.findIndex(node => node.name === "X");
    if (indexNodoX !== -1) {
        nodes.splice(indexNodoX, 1);
    }
  
    // Eliminar el nodo "Y"
    const indexNodoY = nodes.findIndex(node => node.name === "Y");
    if (indexNodoY !== -1) {
        nodes.splice(indexNodoY, 1);
    }
  
    // Eliminar aristas conectadas a "X" y "Y"
    edges = edges.filter(edge => edge.start !== "X" && edge.end !== "X" && edge.start !== "Y" && edge.end !== "Y");
  }
  eliminarNodosOrigenDestino()

  // Cambiar color de las aristas
  for (let x = 0; x < edges.length; x++) {
    const esAristaEnFlujoMaximo = aristas.some(arista =>
      edges[x].start === arista.start && edges[x].end === arista.end
    );

    if (esAristaEnFlujoMaximo) {
      edges[x].color = '#000000';
    } else {
      edges[x].color = '#a1a1a3';
    }
  }

  // Cambiar color de los nodos
  for (let x = 0; x < nodes.length; x++) {
    const esNodoEnFlujoMaximo = aristas.some(arista =>
      nodes[x].name === arista.start || nodes[x].name === arista.end
    );

    if (esNodoEnFlujoMaximo) {

      if (nodes[x].type != 'normal') {
        nodes[x].color = '#0000ff';
      } else {
        nodes[x].color = '#ffcc00';
      }

    } else {
      nodes[x].color = '#676769';
    }
  }

  
  time(endTime - startTime);

  const frase = "Flujo Maximo: " + maxFlow;
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';

  ctx.fillText(frase, 700, 580);
}

function time(duration) {//imprecion del tiempo de ejecucion

  drawNodes();
  console.log("Duracion: " + duration + ' milisegundos');


  const frase = "Tiempo de Ejecucion: 0h 0m  " + duration.toFixed(2) / 1000 + 's';
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';

  ctx.fillText(frase, 650, 30);


  startTime = 0;
  endTime = 0;


}

function Verificacion() {//verifica si hay un grafo valido

  if (nodes.length === 0 || edges.length === 0) {
    return false;
  }


  const nodoInicial = nodes.find(node => node.type === 'Inicial');

  if (!nodoInicial) {
    return false;
  }

  if (nodoInicial && !edges.some(edge => edge.start === nodoInicial.name)) {
    return false;
  }


  const nodoFinal = nodes.find(node => node.type === 'Final');

  if (!nodoFinal) {
    return false;
  }

  if (nodoFinal && !edges.some(edge => edge.end === nodoFinal.name)) {
    return false;
  }


  return true;
}

//Controoladores de botones
let listElements = document.querySelectorAll('.list__button--click');
listElements.forEach(listElement => {
  listElement.addEventListener('click', () => {

    listElement.classList.toggle('arrow');

    let height = 0;

    let menu = listElement.nextElementSibling;
    if (menu.clientHeight == "0") {
      height = menu.scrollHeight;
    }

    menu.style.height = `${height}px`;


  })
})

let elements = document.querySelectorAll('.Abrir, .New, .GuardarA, .GuardarImg, .Borrar, .Agregar, .AgregarArista, .CambiarValor, .EliminarArista, .Dijkstra, .Fulkerson, .CambiarF, .CambiarO');
elements.forEach(element => {
  element.addEventListener('click', () => {

    const clickedClass = element.classList[2];


    switch (clickedClass) {
      //__________________________________________BOTONES DE ARCHIVOS______________________________________

      case 'Abrir': openProject(); break;//boton abrir archivo

      case 'New': newProject(); break;//boton nuevo archivo

      case 'GuardarA': saveProject(); break;//boton guardar archivo

      case 'GuardarImg': saveImg(); break;//boton guardar como imagen

      //__________________________________________BOTONES DE NODOS______________________________________

      case 'Borrar': deleteNode(); break;//boton borrar nodos

      case 'Agregar': alert('Doble clik en el panel para agregar nodo'); break;//boton Agregar nodos

      case 'CambiarF': ChangeNodeFinal(); break;//boton para cambair a nodo final

      case 'CambiarO': ChangeNodeInicial(); break;//boton para cambair a nodo Inicial

      //__________________________________________BOTONES DE ARISTAS______________________________________

      case 'AgregarArista': addEdge(); break;//boton Agregar Arista

      case 'CambiarValor': changeEdgeValue(); break;//boton cambiar valor de aritas

      case 'EliminarArista': deleteEdge(); break;//boton eliminar arista

      //__________________________________________BOTONES DE OPERACIONES______________________________________

      case 'Dijkstra': EjecucionDijkstra(); break;//boton camino mas corto

      case 'Fulkerson': EjecucionFulkerson(); break;//flujo maximo

      default: break;
    }
  });
});
