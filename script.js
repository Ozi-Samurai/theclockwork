let selectedNode = null;
let Graph = null;


const bgm = document.getElementById('bgm');

function startMusic() {
  bgm.volume = 0.5;
  bgm.play();
  window.removeEventListener('click', startMusic);
}

window.addEventListener('click', startMusic);


fetch('./substations.json')
  .then(res => res.json())
  .then(data => {
    const nodes = [];
    const links = [];

    const safeId = id => id.replace(/[^a-zA-Z0-9_-]/g, '_');

    data.rooms.forEach(room => {
      nodes.push({
        id: safeId(room.id),
        name: room.name,
        img: room.image || '',
        description: room.description || ''
      });

      (room.connections || [])
        .filter(t => t && t.trim() !== "")
        .forEach(target => {
          links.push({
            source: safeId(room.id),
            target: safeId(target)
          });
        });
    });


    Graph = ForceGraph3D()
      (document.getElementById('3d-graph'))
      .graphData({ nodes, links })
      .nodeLabel('name')
      .linkColor(() => 'rgba(255,255,255,0.8)')
      .nodeThreeObject(node => {
        const texture = new THREE.TextureLoader().load(node.img || 'serene.png');
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(12, 12, 1);
        return sprite;
      })
      .cooldownTicks(100)
      .d3AlphaDecay(0.02);

    Graph.enableNodeDrag(false);
    Graph.cameraPosition({ z: 100 });


    Graph.onNodeClick(node => {
      selectedNode = node;
      showInfo(node);
      updateInfoPosition();
    });


    Graph.onEngineTick(() => {
      updateInfoPosition();
    });
  });

console.log(node);
function showInfo(node) {
  const box = document.getElementById('infoBox');
  const title = document.getElementById('infoTitle');
  const img = document.getElementById('infoImage');
  const desc = document.getElementById('infoDesc');

  desc.textContent = node.description || "No description available.";
  title.textContent = node.name;

  if (node.img) {
    img.src = node.img;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  box.style.display = 'block';
}


function updateInfoPosition() {
  if (!selectedNode || !Graph) return;

  const box = document.getElementById('infoBox');

  const vec = new THREE.Vector3(
    selectedNode.x,
    selectedNode.y,
    selectedNode.z
  );

  vec.project(Graph.camera());

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  box.style.left = `${x + 12}px`;
  box.style.top = `${y + 12}px`;
}
