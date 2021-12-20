# Mini interprete de Prolog
[![Node.js CI](https://github.com/brunograssano/MiniProlog-Interpreter/actions/workflows/node.js.yml/badge.svg)](https://github.com/brunograssano/MiniProlog-Interpreter/actions/workflows/node.js.yml)

Mini interprete de prolog implementado en Typescript para Técnicas de Diseño - FIUBA

## Enunciado
En el ámbito de la programación lógica los sistemas tienen una estructura que está dada por una base de datos - conformada por hechos y reglas - más un intérprete que acepta consultas y las responde extrayendo información y operando sobre la base de datos.

Se pide desarrollar un intérprete que, frente a consultas, responda afirmativamente o negativamente a dichas preguntas.

Las reglas deben leerse como una relación de implicación lógica, es decir que si se cumplen los objetivos de la derecha del operador `:-` , se cumple el objetivo de la izquierda y en definitiva la consulta tiene como respuesta SI, de lo contrario la respuesta es NO.

Seguiremos la convención de Prolog: Las letras minúsculas iniciales indican átomos concretos, y las letras mayúsculas indican variables sin instanciar. Las variables son sólo válidas dentro de una regla, por lo que un mismo nombre que aparezca en más de una regla representa ítems diferentes. 

Para acotar el alcance del problema:
* Los términos son solo variables o atomos (No hay términos compuestos o números)

Además, pueden optar por algunas de las siguientes opciones:
* Todos los argumentos de un hecho son átomos
* Todos los argumentos de una regla son variables
* No se realizarán llamados recursivos entre reglas o a sí mismas
* Reglas compuestas solamente por una disyunción de predicados


### Ejemplo de base de datos con definiciones y dos reglas.
```
varon(juan).
varon(pepe).
varon(hector).
varon(roberto).
varon(alejandro).
mujer(maria).
mujer(cecilia).
padre(juan, pepe).
padre(juan, pepa).
padre(hector, maria).
padre(roberto, alejandro).
padre(roberto, cecilia).
hijo(X, Y) :- varon(X), padre(Y, X).
hija(X, Y) :- mujer(X), padre(Y, X).
```
Ejemplo de uso

```
padre(juan, pepe) --> SI
padre(mario, pepe) --> NO
hijo(pepe, juan) --> SI
hija(maria, roberto) --> NO
```

El sistema debe tomar la base de datos desde un archivo de texto y poder responder las consultas ingresadas por consola.

## Ejecución
1. Instalar Node JS
2. Ejecutar `npm install`
3. Ejecutar `npm test` para correr las pruebas o `npm start` para ejecutar el interprete (carga la base de datos de ejemplo y se le pueden hacer consultas)

## Implementación
La parte interesante de la implementación seria a partir de `exploreTree`. Se llega a este punto cuando se tiene una regla que tiene un cuerpo, por lo que hay que empezar a analizar las diferentes opciones manteniendo las restricciones que se agregan a las variables del problema. Para recorrer este árbol de posibilidades se utiliza backtracking a medida que se van permutando los valores posibles de las variables. Si se llega a encontrar una solución se termina el recorrido y se devuelve el resultado, mientras que no se encuentre solución se va a recorrer el árbol entero.

