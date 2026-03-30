import { createProgram, createShader } from '../utils/gl-utils.js';

let numLados = 3;

export function setupWebGL() {
    const canvas = document.querySelector('#regularPolygonCanvas');
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        console.error('WebGL2 não está disponível');
        throw new Error('WebGL2 não suportado');
    }

    return gl;
}

const sceneObjects = {};

export function initialize(gl) {
    // inicializa o shader the vértice e fragmento e em seguida os compila
    // são programas executados pela GPU sempre que algo precisa ser desenhado
    const vertexShaderCode = document.querySelector('[type="shader/vertex"]').textContent;
    const fragmentShaderCode = document.querySelector('[type="shader/fragment"]').textContent;

    // finaliza a combinação (compila + link) dos shaders em um programa
    sceneObjects.program = createProgram(gl,
        createShader(gl, 'vs', gl.VERTEX_SHADER, vertexShaderCode),
        createShader(gl, 'fs', gl.FRAGMENT_SHADER, fragmentShaderCode)
    );
    gl.useProgram(sceneObjects.program);

    // define os vértices de um polígono regular
    const vertices = polygonVertices();

    // cria um VAO para as configurações do polígono regular e um Buffer com vértices
    sceneObjects.regularPolygonVao = gl.createVertexArray();
    gl.bindVertexArray(sceneObjects.regularPolygonVao);

    sceneObjects.regularPolygonVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjects.regularPolygonVbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // configura o atributo 'position' ("in vec2 position" do shader) para 
    // receber os dados do buffer quando o programa (shaders) for executado
    const positionAttributeLocation = gl.getAttribLocation(sceneObjects.program, 'position');
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // guarda a quantidade de vértices do polígono regular
    sceneObjects.regularPolygonVertexCount = vertices.length / 2;

    // configura os "limites do mundo" (projeção) e registra para reconfigurar
    // sempre que o canvas for redimensionado
    const projectionUniformLocation = gl.getUniformLocation(sceneObjects.program, 'projection');
    const projectionMatrix = ortho(0, 100, 0, 100, -1, 1);
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);

    // obtém a localização do uniforme de cor para atualizar dinamicamente
    sceneObjects.colorUniformLocation = gl.getUniformLocation(sceneObjects.program, 'color');

    // obtém a localização do uniforme de offset
    const offsetUniformLocation = gl.getUniformLocation(sceneObjects.program, 'offset');
    gl.uniform2f(offsetUniformLocation, 0.0, 0.0);

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco

    // registra evento para aumentar/reduzir a quantidade de lados
    window.addEventListener('keydown', (event) => {
        if (event.key === '+' || event.key === '=') {
            numLados++;
            updatePolygon(gl);
            render(gl);
        }

        if (event.key === '-' && numLados > 3) {
            numLados--;
            updatePolygon(gl);
            render(gl);
        }
    });

    configureResizableWorld(gl, projectionUniformLocation);
    // --- fim do código de configuração ---
}

export function render(gl) {
    // apaga a tela
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(sceneObjects.program);

    // ativa o vao do polígono regular e o desenha
    gl.bindVertexArray(sceneObjects.regularPolygonVao);
    gl.uniform3f(sceneObjects.colorUniformLocation, 0.0, 0.7, 0.7);
    gl.drawArrays(gl.LINE_LOOP, 0, sceneObjects.regularPolygonVertexCount);
}

// função auxiliar para gerar os vértices do polígono regular
function polygonVertices() {
    const vertices = [];
    const centroX = 50.0;
    const centroY = 50.0;
    const raio = 30.0;

    for (let i = 0; i < numLados; i++) {
        const angulo = i * (2 * Math.PI / numLados);
        const x = centroX + raio * Math.cos(angulo);
        const y = centroY + raio * Math.sin(angulo);

        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

// função auxiliar para atualizar o polígono quando o número de lados mudar
function updatePolygon(gl) {
    const vertices = polygonVertices();

    gl.bindVertexArray(sceneObjects.regularPolygonVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjects.regularPolygonVbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    sceneObjects.regularPolygonVertexCount = vertices.length / 2;
}

// função auxiliar para criar uma matriz de projeção ortográfica
// como um 1D array (column-major, como o WebGL espera)
function ortho(left, right, bottom, top, near, far) {
    const tx = -(right + left) / (right - left);
    const ty = -(top + bottom) / (top - bottom);
    const tz = -(far + near) / (far - near);

    return new Float32Array([ // lembre-se, column-major
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, -2 / (far - near), 0,
        tx, ty, tz, 1
    ]);
}

// função auxiliar para ajustar a projeção ao redimensionamento do canvas
function configureResizableWorld(gl, projectionUniformLocation) {
    function resizeCanvas() {
        const canvas = gl.canvas;
        const displayWidth = canvas.clientWidth || canvas.width;
        const displayHeight = canvas.clientHeight || canvas.height;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        gl.useProgram(sceneObjects.program);
        const projectionMatrix = ortho(0, 100, 0, 100, -1, 1);
        gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);
        render(gl);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}