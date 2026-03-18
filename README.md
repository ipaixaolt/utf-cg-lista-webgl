# Lista de Exercícios
## WebGL -- Primeiros Passos

Enunciado geral: você vai fazer 3 exercícios, cada um em sua pastinha:
- Exercício 1: pasta `quadrados-felizes`, com seu arquivo HTML, CSS (talvez) 
  e JavaScript
- Exercício 2: pasta `disco-quadrado`, idem
- Exercício 3: pasta `poligono-regular`, idem

Primeiramente, crie um _fork_ do repositório [fegemo/utf-cg-lista-webgl][fork].
Assim, você terá a sua versão do código lá no Github.com. Em seguida,
clone-o para sua máquina 
(`git clone https://github.com/seu-user/utf-cg-lista-webgl`). Isso vai baixar
o repositório para seu computador. Então, trabalhe nas atividades 
(cada uma tem sua pastinha). Ao concluir, adicione todos os arquivos
(`git add -A`) para então fazer um _commit_ (`git commit -m "Bela mensagem"`).
Por fim, você deve fazer _upload_ das alterações do repositório de volta ao
Github, fazendo um _push_ (`git push -u origin main`).

Em seguida (ué, não era "por fim"??), vá até seu repositório no Github.com
(visite https://github.com/seu-user/utf-cg-lista-webgl) para habilitar
o serviço Github Pages. Faça isso navegando para "Settings" (do repositório),
depois em "Pages", e escolha o _branch_ `main`. Isso vai fazer com que 
todos nós, a humanidade, possa acessar seu exercício navegando para
https://seu-user.github.io/utf-cg-lista-webgl/. Não é incrível?

<details>
  <summary>Ativando Github Pages para seu repositório</summary>
  
  ![](https://raw.githubusercontent.com/fegemo/utf-cg/refs/heads/main/exercises/webgl-prim/images/square-annulus.png)
</details>


Você deve usar uma projeção ortogonal, assim como vimos em aula. Mas qual o
volume de visualização você vai escolher? Fique à vontade. Uma ideia é a que
vimos na aula: x,y ∈ [0, 100]. Outra, talvez melhor¹: x ∈ [0, `gl.canvas.width`] e
y ∈ [`gl.canvas.height`, 0]. Por ora, mantenha z ∈ [-1, 1].


## **Exercício 1**
Crie uma página Web `quadrados-felizes/index.html` com um programa em WebGL 
que desenha 9 quadrados na tela (3 linhas e 3 colunas), cada um de uma cor,
usando as cores especificadas na [aula webgl-handson][varias-cores].

- _Importante_: evite repetição de código (Ctrl+C/Ctrl+V). Repare os trechos
  que se repetem e refatore-os. Reflita: quais atributos você precisa para 
  representar um vértice neste exercício? E para representar cada objeto
  (quadrado)?<br>
  Ao encontrar um padrão, considere propor uma estrutura de dados 
  (em JavaScript, um objeto) que seja capaz de descrever um quadrado. 
  Crie 9 desses objetos. Ao desenhar, itere sobre uma lista deles,
  por exemplo, ativando seu VAO e definindo sua cor, para então 
  mandar desenhá-lo. 
- _Otimizando, se quiser_: um quadrado sempre terá quatro vértices. 
  E todos os 9 possuem o mesmo tamanho. Portanto, é possível usar 
  um único VBO/VAO para os vértices do quadrado, bastando definir suas 
  coordenadas. Mas aí como mudar sua posição? Você pode, no _vertex shader_,
  ter uma `uniform vec2 deslocamento`, que conterá um vetor a ser somado
  à posição (x,y) de cada coordenada (antes de multiplicar pela matriz 
  de projeção). Daí, o quadrado do meio, terá esse vetor como (0, 0). 
  E os outros terão valores diferentes.


## **Exercício 2**
Faça uma página Web `disco-quadrado/index.html` com um programa WebGL 
que desenha, no centro da janela, um "disco quadrado" (um quadrado furado),
como na figura a seguir. Você deve fazer uma triangulação, _i.e._, 
use uma primitiva que  envolva triângulos (qual seria a melhor: 
`gl.TRIANGLES`, `gl.TRIANGLE_FAN` ou `gl.TRIANGLE_STRIP`?). Obs: um deles 
é melhor... se precisar, faça no papel primeiro.

Ao iniciar o programa, deve-se ver apenas o disco quadrado em azul --- sem os
traços (contornos pretos dos triângulos). Quando a tecla <kbd>c</kbd> for
pressionada, devem surgir os traços pretos por cima do disco quadrado (e
tanto o azul preenchido quanto o contorno preto devem ser mostrados).

- _Dikentinha_: Você pode desenhar o mesmo objeto duas vezes: (a) ativa seu VAO
(se ainda não estiver), (b) desenha uma vez usando sua primitiva escolhida, 
depois (c) desenha de novo (nova _draw call_) mas com uma primitiva baseada em
linhas (eg, `gl.LINES` ou `gl.LINE_STRIP` ou `gl.LINE_LOOP`). Ao desenhar
pela segunda vez (apenas as linhas --- ie, contornos), defina a cor para preto.

![](images/square-annulus.png)


## **Exercício 3**

Crie umam página Web `poligono-regular/index.html` com um programa em WebGL que
desenha no centro da janela um polígono regular --- todos os ângulos internos
iguais e todas as arestas de mesmo comprimento. O programa deve ter uma
constante "`const NUM_LADOS`" que determina  quantos lados esse polígono 
regular deve ter. Em outras palavras, se `NUM_LADOS=4`, o programa deve 
desenhar um quadrado; se `NUM_LADOS=5`, um pentágono regular e assim por diante.

- _Dikentinha_: a posição `x,y` dos vértices vai variar de acordo com
  `Math.sin(t)`, `Math.cos(t)`, sendo `t` uma variável que contém ângulo e 
  varia de `0` a `2*PI` (360 graus). Se você multiplicar o seno e cosseno 
  por um raio `R` (eg, `R=30` se seu mundo tiver uma largura de ~100, 
  ele terá um tamanho visível.

![](./images/circle-aprox2.png)

- _Nota_: alunos com [qualidade super premium][super-premium] (99% da turma)
costumam usar uma variável `let numLados` em vez de uma constante e 
ainda fazem com que as teclas `+` e `-` aumentem/reduzam o valor 
dessa variável. Incrível!!!

[super-premium]: https://www.youtube.com/watch?v=4CooiNDnPHI
[varias-cores]: https://fegemo.github.io/utf-cg/classes/webgl-handson/#valores-rgb-de-algumas-cores

Você deve entregar esta atividade via **SIGAA**, apenas o link no
formato https://seu-user.github.io/utf-cg-lista-webgl/.



## Notas de Rodapé

¹Projeção x ∈ [0, `gl.canvas.width`] e y ∈ [`gl.canvas.height`, 0]: para 
jogos/aplicações 2D em que queremos usar o mouse para "clicar nas coisas",
pode ser útil que a projeção usada seja a mesma da janela. Daí, quando ocorre
um evento `click`, basta pegar as coordenadas com 
`event.offsetX` e `event.offsetY`. Isso porque para o navegador, o (0,0) do
`<canvas>` é o canto superior esquerdo (e não inferior esquerdo).<br><br>
Nestes exercícios não vamos usar _mouse_, mas no TP1 sim. Então, pode ser uma
boa ideia se lembrar disso ;)