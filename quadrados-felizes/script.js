import { createProgram, createShader } from '../utils/gl-utils.js';

export function setupWebGL() {
    const canvas = document.querySelector('#happySquaresCanvas');
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        console.error('WebGL2 não está disponível');
        throw new Error('WebGL2 não suportado');
    }

    return gl;
}

const sceneObjects = {};

export function initialize(gl) {
    const vertexShaderCode = document.querySelector('[type="shader/vertex"]').textContent;
    const fragmentShaderCode = document.querySelector('[type="shader/fragment"]').textContent;

    sceneObjects.program = createProgram(
        gl,
        createShader(gl, 'vs', gl.VERTEX_SHADER, vertexShaderCode),
        createShader(gl, 'fs', gl.FRAGMENT_SHADER, fragmentShaderCode)
    );
    gl.useProgram(sceneObjects.program);

    const vertices = new Float32Array([
        0.0, 0.0,
        20.0, 0.0,
        20.0, 20.0,
        0.0, 20.0
    ]);

    sceneObjects.squareVao = gl.createVertexArray();
    gl.bindVertexArray(sceneObjects.squareVao);

    sceneObjects.squareVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjects.squareVbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(sceneObjects.program, 'position');
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    const projectionUniformLocation = gl.getUniformLocation(sceneObjects.program, 'projection');
    const projectionMatrix = ortho(0, 100, 0, 100, -1, 1);
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);

    const squareSize = 20;
    const squareOffset = 5;
    const gridSize = 3 * squareSize + 2 * squareOffset;
    const startX = (100 - gridSize) / 2;
    const startY = (100 - gridSize) / 2;

    const colors = [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0],
        [1.0, 0.0, 1.0],
        [0.0, 1.0, 1.0],
        [1.0, 0.5, 0.0],
        [0.5, 0.0, 1.0],
        [0.3, 0.3, 0.3]
    ];

    sceneObjects.squares = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            sceneObjects.squares.push({
                x: startX + j * (squareSize + squareOffset),
                y: startY + i * (squareSize + squareOffset),
                color: colors[i * 3 + j]
            });
        }
    }

    sceneObjects.offsetUniformLocation = gl.getUniformLocation(sceneObjects.program, 'offset');
    sceneObjects.colorUniformLocation = gl.getUniformLocation(sceneObjects.program, 'color');

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    configureResizableWorld(gl, projectionUniformLocation);
}

export function render(gl) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(sceneObjects.program);
    gl.bindVertexArray(sceneObjects.squareVao);

    for (const square of sceneObjects.squares) {
        gl.uniform2f(sceneObjects.offsetUniformLocation, square.x, square.y);
        gl.uniform3fv(sceneObjects.colorUniformLocation, square.color);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
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

function ortho(left, right, bottom, top, near, far) {
    const tx = -(right + left) / (right - left);
    const ty = -(top + bottom) / (top - bottom);
    const tz = -(far + near) / (far - near);

    return new Float32Array([
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, -2 / (far - near), 0,
        tx, ty, tz, 1
    ]);
}