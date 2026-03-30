import { createProgram, createShader } from '../utils/gl-utils.js';

export function setupWebGL() {
    const canvas = document.querySelector('#squareDiscCanvas');
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        console.error('WebGL2 não está disponível');
        throw new Error('WebGL2 não suportado');
    }

    return gl
}

const sceneObjects = {
    showLines: false
};

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

    // define um disco quadrado
    const vertices = new Float32Array([
        20.0, 20.0, 35.0, 35.0,
        80.0, 20.0, 65.0, 35.0,
        80.0, 80.0, 65.0, 65.0,
        20.0, 80.0, 35.0, 65.0,
        20.0, 20.0, 35.0, 35.0
    ]);

    // cria um VAO para as configurações do disco quadrado e um Buffer com vértices
    sceneObjects.squareDiscVao = gl.createVertexArray();
    gl.bindVertexArray(sceneObjects.squareDiscVao);
    sceneObjects.squareDiscVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjects.squareDiscVbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // configura o atributo 'position' ("in vec2 position" do shader) para 
    // receber os dados do buffer quando o programa (shaders) for executado
    const positionAttributeLocation = gl.getAttribLocation(sceneObjects.program, 'position');
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // configura as linhas externas
    const outerLineVertices = new Float32Array([
        20.0, 20.0,
        80.0, 20.0,
        80.0, 80.0,
        20.0, 80.0
    ]);

    sceneObjects.outerLinesVao = gl.createVertexArray();
    gl.bindVertexArray(sceneObjects.outerLinesVao);
    sceneObjects.outerLinesVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjects.outerLinesVbo);
    gl.bufferData(gl.ARRAY_BUFFER, outerLineVertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // configura as linhas internas
    const innerLineVertices = new Float32Array([
        35.0, 35.0,
        65.0, 35.0,
        65.0, 65.0,
        35.0, 65.0
    ]);

    sceneObjects.innerLinesVao = gl.createVertexArray();
    gl.bindVertexArray(sceneObjects.innerLinesVao);
    sceneObjects.innerLinesVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjects.innerLinesVbo);
    gl.bufferData(gl.ARRAY_BUFFER, innerLineVertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // configura os "limites do mundo" (projeção) e registra para reconfigurar
    // sempre que o canvas for redimensionado
    sceneObjects.projectionUniformLocation = gl.getUniformLocation(sceneObjects.program, 'projection');
    const projectionMatrix = ortho(0, gl.canvas.width, 0, gl.canvas.height, -1, 1);
    gl.uniformMatrix4fv(sceneObjects.projectionUniformLocation, false, projectionMatrix);

    // obtém a localização do uniforme de cor para atualizar dinamicamente
    sceneObjects.colorUniformLocation = gl.getUniformLocation(sceneObjects.program, 'color');

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco

    // registra evento para mostrar/esconder os traços pretos
    window.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'c') {
            sceneObjects.showLines = !sceneObjects.showLines;
            render(gl);
        }
    });

    configureResizableWorld(gl, sceneObjects.projectionUniformLocation)
    // --- fim do código de configuração ---
}

export function render(gl) {
    // apaga a tela
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(sceneObjects.program);

    // ativa o vao do disco quadrado e o desenha preenchido em azul
    gl.bindVertexArray(sceneObjects.squareDiscVao);
    gl.uniform3f(sceneObjects.colorUniformLocation, 0.0, 0.0, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);

    // desenha os contornos pretos por cima, se habilitado
    if (sceneObjects.showLines) {
        gl.uniform3f(sceneObjects.colorUniformLocation, 0.0, 0.0, 0.0);

        gl.bindVertexArray(sceneObjects.outerLinesVao);
        gl.drawArrays(gl.LINE_LOOP, 0, 4);

        gl.bindVertexArray(sceneObjects.innerLinesVao);
        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    }
}

function configureResizableWorld(gl, projectionUniformLocation) {
    const resizableContainer = gl.canvas.closest('.resizable-container')

    // cria um observador do tamanho do canvas
    const resizeObserver = new ResizeObserver(([entry, ...others]) => {
        const { width, height } = entry.contentRect

        // atualiza o tamanho real do canvas
        gl.canvas.width = width
        gl.canvas.height = height

        // define o sistema da janela de visualização para cobrir todo o canvas
        // e redesenha
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

        // calcula a matriz de projeção ortográfica considerando
        // a proporção de largura/altura do canvas para evitar distorção
        // da imagem (achatada ou alongada)
        const aspectRatio = width / height
        const projectionMatrix = ortho(0, 100, 0, 100 / aspectRatio, -1, 1)

        // envia a matriz de projeção para o shader (GPU) para que seja usada,
        // daí redesenha no novo estado
        gl.useProgram(sceneObjects.program)
        gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix)
        render(gl)
    })

    resizeObserver.observe(resizableContainer)
}

// função auxiliar para criar uma matriz de projeção ortográfica
// como um 1D array (column-major, como o WebGL espera)
function ortho(left, right, bottom, top, near, far) {
    const tx = -(right + left) / (right - left)
    const ty = -(top + bottom) / (top - bottom)
    const tz = -(far + near) / (far - near)

    return new Float32Array([ // lembre-se, column-major
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, -2 / (far - near), 0,
        tx, ty, tz, 1
    ])
}