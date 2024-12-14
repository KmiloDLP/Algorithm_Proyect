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

function addEdge() {//7) agregar aristas
  const startNodeValue = document.getElementById('startNode').value
  const endNodeValue = document.getElementById('endNode').value;
  const edgeValue = parseInt(document.getElementById('edgeValue').value);


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
  console.log(edges);

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

let elements = document.querySelectorAll('.BFS, .New, .GuardarA, .GuardarImg, .Borrar, .Agregar, .AgregarArista, .CambiarValor, .EliminarArista, .Dijkstra, .Fulkerson, .CambiarF, .CambiarO');
elements.forEach(element => {
  element.addEventListener('click', () => {

    const clickedClass = element.classList[2];


    switch (clickedClass) {
      //__________________________________________BOTONES DE ARCHIVOS______________________________________

      case 'BFS': BFS(); break;//boton abrir archivo

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


function BFS() {
  let cola = []; 
  let visitados = new Set();


  cola.push(nodes[0].name);
  visitados.add(nodes[0].name);

  let resultado = [];

  while (cola.length > 0) {
    let actual = cola.shift();
    resultado.push(actual);


    for (let edge of edges) {
      if (edge.start === actual && !visitados.has(edge.end)) {
        cola.push(edge.end);
        visitados.add(edge.end);
      }
    }
  }

  console.log("BFS:", resultado);
}

function DFS() {
  let visited = new Set(); 
  let stack = [];
  let result = []; /

  stack.push(nodes[0].name); 

  while (stack.length > 0) {
    let current = stack.pop();

    if (!visited.has(current)) {
      visited.add(current);
      result.push(current);


      let neighbors = edges
        .filter(edge => edge.start === current && !visited.has(edge.end)) 
        .map(edge => edge.end)
        .sort((a, b) => b - a); 


      for (let neighbor of neighbors) {
        stack.push(neighbor);
      }
    } 0
  }

  console.log("DFS Result:", result);
}

function IDS(target) {
  
  function DLS(node, depth, visited) {
    if (depth === 0) return []; 
    if (node === target) return [node]; 

    visited.add(node); 

    
    let neighbors = edges
      .filter(edge => edge.start === node) 
      .map(edge => edge.end); 


    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        let path = DLS(neighbor, depth - 1, visited); 
        if (path.length > 0) {
          return [node, ...path]; 
        }
      }
    }

    return []; 
  }


  for (let depth = 1; depth <= nodes.length; depth++) {
    let visited = new Set(); 
    let startNode = nodes[0].name;
    let path = DLS(startNode, depth, visited);

    if (path.length > 0) {
      console.log(`Encontrado: ${target} en profundidad ${depth}`);
      console.log("Camino:", path);
      return path; 
    }
  }

  console.log(`Objetivo ${target} no encontrado`);
  return [];
}



addNode(445.1999969482422, 121.39999771118164);
addNode(350.1999969482422, 192.39999771118164);
addNode(552.1999969482422, 185.39999771118164)
addNode(269.1999969482422, 276.39999771118164)
addNode(421.1999969482422, 280.39999771118164)
addNode(542.1999969482422, 281.39999771118164)
addNode(637.1999969482422, 281.39999771118164)

edges.push({ start: 1, end: 2, value: 0, color: '#000000' })
edges.push({ start: 1, end: 3, value: 0, color: '#000000' })
edges.push({ start: 2, end: 4, value: 0, color: '#000000' })
edges.push({ start: 2, end: 5, value: 0, color: '#000000' })
edges.push({ start: 3, end: 6, value: 0, color: '#000000' })
edges.push({ start: 3, end: 7, value: 0, color: '#000000' })

drawNodes()

