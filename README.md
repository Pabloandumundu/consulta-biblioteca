#Práctica del [IFCD0110](https://www.sepe.es/contenidos/personas/formacion/certificados_de_profesionalidad/pdf/fichasCertificados/IFCD0110_ficha.pdf) : formularios y tablas con JQuery

##Descripción
La práctica consiste en la creación de una estructura de datos con las siguientes funcionalidades:

* Visualización de la misma a través de una tabla en HTML.
* Alta de datos en dicha estructura obtenidos mediante formulario validado.
* Modificación de datos existentes en la estructura a través del formulario anterior.
* Bajas de datos de la estructura.

Una posible extensión de funcionalidad sería el filtrado/consulta de datos de la estructura indicando las claves a través del formulario para luego visualizar el resultado en la tabla.

##Planteamiento
Para desarrollar la práctica nos hemos basado en el inventario de una librería/biblioteca sencilla. 

La estructura de datos estará formada por un array que corresponde al inventario y que contiene objetos asimilables a libros, cada uno con 5 propiedades o atributos:

1. ISBN del libro
2. Título de la obra
3. Autor o autores
4. Año de publicación
5. Editorial

Una representación en "pseudocódigo" de esta estructura sería la siguiente:

	libreria[
    	[0]{isbn:"1234567890", titulo:"JQuery y tú", autor:"Guillermo Puertas", anio:"2016", editorial:"Mocosoft"}
        [1]{isbn:"0987654321", titulo:"Ajax, ¿pino?", autor:"Alan Turming", anio:"1950", editorial:"Enigma"}
        ...
    ]

##Miembros del proyecto
Las personas que han participado en el desarrollo del código son:

* Adrián Arteaga
* Juan José Basco
* Pablo Andueza
* Pablo Garrido
* Rubén Álvarez

##Desarrollo
###Vers. 0
**\- Interfaz del usuario**

Se compondrá de:

* Un formulario con los campos correspondientes a las 5 propiedades de los objetos libros almacenados en el array librería, que permitirá añadir nuevos libros o modificar los datos de los ya existentes.
* Un grupo de tres botones: "Actualizar" (altas de datos); "Modificar" (modificación de datos almacenados); "Borrar" (bajas de datos).
* Una tabla con una cabecera fija para representar el contenido de la estructura de datos.

El interfaz debe ser responsivo de manera que se adapte a dispositivos móviles, tabletas y sobremesa.

También se atenderá a la accesibilidad de la aplicación, tanto para la navegación por la página, como la inclusión de ayudas a la hora de completar campos o el uso de botones.


**\- Validaciones de datos**

La validación de datos se realizará en varios niveles:

1. Mediante mensajes de texto en HTML: indicación de campos obligatorios; sugerencias en los propios campos del formulario mediante el atributo *placeholder*.
2. Validación según el usuario va escribiendo en cada uno de los campos. De esta forma recibirá orientación sobre la validez de los datos que está introduciendo.
3. Validación antes de añadir o modificar. Si los datos no cumplen los requisitos especificados no se almacenarán o modificarán en la estructura de datos.


**\- Altas de datos (Añadir)**

Para añadir un libro el usuario debe completar al menos los campos obligatorios con el formato adecuado y pulsar el botón "Añadir".
En ese momento se almacenará un objeto formado con los datos del formulario al final del array librería, se borrarán los campos y se mostrará el contenido de librería a través de la tabla.

**\- Seleccionar datos de la tabla para modificar o borrar**

Al hacer click sobre una fila de la tabla esta quedará remarcada en color y el formulario se auto-completará con los datos de la misma.
Si se vuelve a clickar sobre la línea esta volverá a su estado visual anterior y el formulario quedará en blanco.

Como las líneas de la tabla tienen que estar relacionadas con el índice del array librería (para saber que elemento hay que modificar o borrar), la tabla incluirá una **celda al final que estará oculta y que incluirá el índice correspondiente del elemento en el array**.
A su vez en el formulario se creará un campo oculto para recibir el dato de dicha celda y al objeto libro de la estructura de datos se le añadirá un atributo "índice" para almacenarlo.

**\- Modificar datos**

Una vez seleccionada una fila, el usuario puede modificar los datos en el formulario y pulsar el botón "Modificar" para que se guarden dichos campos (previa validación). Se actualizará la tabla con la modificación y se limpiará el formulario.

**\- Bajas de datos (Borrar)**

Una vez seleccionada una fila el usuario puede pulsar el botón "Borrar" se eliminará esa entrada del array, se mostrará la tabla modificada y se limpiará el formulario.

**\- Testeo y correcciones**

1. Cuando se selecciona una fila de la tabla y se modifica algún campo del formulario, si se selecciona una nueva fila (si haber pulsado "Modificar") se pierden los cambios realizados por el usuario. CORRECCIÓN: solicitar confirmación del usuario cuando esto suceda.
2. Es posible borrar una entrada por descuido del usuario. CORRECCIÓN: solicitar confirmación al usuario antes de borrar.
3. Los botones carecen de una lógica de negocio adecuada. Es posible pulsar "Modificar" y "Borrar" sin haber seleccionado una fila de la tabla. Si se selecciona una fila y se pulsa "Añadir" se genera un nuevo elemento en el array que es una copia del seleccionado. CORRECCIÓN: "Añadir" sólo está disponible si no hay ninguna fila seleccionada, y "Modificar" y "Borrar" cuando si lo está.
4. Para el testeo de la aplicación hay que crear a mano entradas en el array librería lo que ralentiza las pruebas. CORRECCIÓN: crear una función que genere de forma automática entradas de datos y añadir un botón (**sólo para la fase de desarrollo**) para llamarla.
5. La validación del ISBN es muy básica. CORRECCIÓN: aplicar validación a tres niveles, comprobación de formato de número ISBN, comprobación de código de control ISBN (para ISBN10 e ISBN13) y chequeo que evite que dos elementos de la librería tengan el mismo ISBN.
6. Hay que depurar la responsividad del interfaz.

***

###Vers. 0.1

**\- Aplicación de correcciones**
Se han aplicado las correcciones indicadas en la versión 0.

También se han realizado las siguientes correcciones sobre fallos detectados en el desarrollo:

1. Mejoras en la responsividad y aspecto de la página.
2. Corrección de un bug que eliminaba los "\*" que indican los campos obligatorios al actualizar la tabla.
3. Corrección de un bug al borrar entradas de la tabla que falseaban los índices que relacionan las filas de la tabla con su posición en el array libreria. La corrección también ha supuesto modificar el código de gestiona la selección de filas en la tabla.
4. Adaptada la función *Actualizar()* para admitir parámetros y ser reutilizada en las consultas.
5. Corrección de un bug al comprobar duplicidades de ISBN. La comparación era sensible a mayúsculas y minúsculas por lo que 123456789x se consideraba distinto de 123456789X, ahora ya no.

**\- Implementación de consultas a la estructura de datos**

El usuario podrá rellenar uno o más campos del formulario y pulsar el botón "Consultar". Como resultado la tabla que muestra los elementos almacenados será sustituida por una que muestre las entradas que contengan coincidencias con los datos introducidos.
Dicha tabla adjuntará un "mensaje" que indique que se trata de una consulta y no de los datos almacenados.
El **botón "Consultar"** sólo estará disponible si no hay ninguna fila seleccionada. En el momento de ser pulsado **cambiará el texto "Consultar" por "Volver"** de manera que al pulsarlo de nuevo se volverá al estado anterior a la consulta, es decir: formulario en blanco y la tabla mostrando el contenido de la estructura de datos.

**\- Testeo y correcciones**

1. Mejorar las indicaciones de los campos y botones mediante el uso del atributo HTML *title*
2. Un complemento al punto anterior sería añadir un botón/icono de ayuda que muestre una ventana/recuadro con indicaciones más precisas del uso de la página.
3. Los mensajes pop-up al usuario se hacen mediante alerts y confirms propios del navegador. Buscar librerías Js/JQ para sustituir esas ventanas.
4. La corrección 3 del aptdo. "Aplicación de correcciones" no está bien realizada, ya que al borrar eleemntos no se corrigen los índices.

***

###Vers. 0.2

**\- Implementación de Firebase a la aplicación web (persitencia de la estructura de datos)**

En las versiones anteriores la estructura de datos se implementaba con un array generado desde el código JavaScript de manera que los datos almacenados se perdían al cerrar la ventana del navegador.
Para solucionar esta importante limitación se va a migrar la estructura a una base de datos que se alamcene en un servidor.
La opción tecnológica escogida es **[Firebase](https://firebase.google.com/)**, una plataforma "[backend as a service](https://es.wikipedia.org/wiki/Backend_as_a_service)" de Google que ofrece a desarrolladores WEB frontend acceder a servicios del lado del servidor, siendo uno de ellos el de base de datos clave-valor en tiempo real.
La estructura de datos será muy similar:

    proyecto_firebase_BD-+
                         |
                         coleccion1--+
                         |           |
                         |			isbn: "123456789x"
                         |			titulo: "JQuery y tú"
                         |			autor: "Guillermo Puertas"
                         |			anio: "2016"
                         |			editorial: "Mocosoft"
                         |
                         coleccion2--+
                         |		   |
                        ...       ...
El array pasa a ser la base de datos, los objetos colecciones y los atributos de los objetos junto con sus valores, pares de clave-valor almacenados en las colecciones.

**\- Uso del array libreria**
Se va a mantener la estructura del array como un contenedor intermedio al que volcar la base de datos cuando sea modificada para facilitar la adaptación del código existente. Muchas funciones trabajan con el array libreria y habría que recodificarlas por completo si tuviesen que hacerlo directamente con la base de datos.
No es una solución de código óptima pero si funcional y más rápida.
El primer planteamiento era que cada vez que hubiese un cambio en la base de datos se actualizase el array desde ella (por suscripción) para luego poder trabajar con él (pintar tabla y realizar búsquedas):

	<cambio en la BD>
    	|
	<descarga COMPLETA de la BD a la aplicación>
    	|
	¿tiempo de descarga? - El tiempo dependerá del tamaño de la BD y de la conexión
    	|
	<se actualiza el array>
    	|
	<se pinta el array en la tabla>

Sin embargo se ha visto como mejor solución el discriminar los eventos de suscripción:

									<cambio en la BD>
                    						 |
			________________________________<?>__________________________
			|								|							|
    <Elemento añadido>			<cambio en un elemento>			<elemento borrado>
    		|								|							|
	<descarga del elemento>	   <descarga del elemento>			<descarga del elemento> - Cada elemento incluye info.
    		|								|							|				    sobre su posición en el
		   ...				   tiempo descarga 1 elemento			   ...				   array (índice i)
            |								|							|
	<creo un nuevo elemento	   <modifico los datos del			<borro el elemento i del array>
      al final del array>		   elemento i del array>				|	
      	    |								|							|
	<se pinta el array en 	    <se pinta el array en		<se pinta el array en la tabla>
    	la tabla>					 la tabla>

Con esta opción sólo hay que descargar un elemento de la BD lo que supone un tiempo de espera menor para poder trabajar con él en el array.

**NOTA**: en el repositorio se ha incluido un archivo comprimido (firbase_test.rar) que contiene un html y js con código de pruebas utilizado para el desarrollo de la implementación de Firebase.


**\- Aplicación de correcciones**

1. Integrados *title* en botones como ayuda contextual.
2. Se ha creado un botón de ayuda que despliega una ventana con instrucciones del manejo de la aplicación.
3. Se han sustiruido los pop-up de sistema (alert y confirm) por ventanas de aviso generadas con **[Sweet Alert](http://t4t5.github.io/sweetalert/)**.
4. Corregido el bug relacionado con la selección de elementos de tabla tras un borrado.

***

###Vers. 0.3

**\- Añadida paginación a la tabla**

Pensando en el uso de la aplicación en dispositivos móviles, se ha implementado la posibilidad de paginar la tabla empleada para visualizar la BD y las consultas.
La paginación permite al usuario elegir el número de entradas a mostrar en cada página (o mostrar todas).
También integra funcionalidad en la cabecera de la tabla de manera que se puedan ordenar las entradas en orden ascendente/descendente en función de cualquiera de sus campos.

**\- Testeo y correcciones**

1. La paginación introduce celdas de relleno en las tablas (si hay 8 entradas por página y la página tiene 3 añade 5 vacías) y queda estéticamente mal.
2. Los botones de paginación reaccionan de forma extraña al pasar de un nro. superior de entradas por pag. a uno inferior.
3. Cuando no se han encontrado coincidencias en una búsqueda el aviso aparece por debajo de la paginación y estéticamente queda mal.
4. Cuando se añade una entrada no se visualiza en la tabla si está paginada (se visualiza en la última página).
5. Al modificar o borrar una entrada en páginas posteriores a la 1ª se reinicializa la tabla a la primera página y no se vé la modificación.
6. En las búsquedas, al modificar o borrar, se vuelve automáticamente a la tabla global.
7. El botón de resetear no tiene texto visible que lo identifique (salvo su *title*).
8. En las ventanas modales de confirmación el enter/intro es por defecto la opción contraria a cancelar.
9. La ordenación por año de publicación funciona mal (posiblemente por ser texto).
10. El espacio del formulario y la botonera hacen que en algunos casos la tabla no se visualice y haya que hacer scroll.
11. El botón de cierre de la ventana de ayuda no se posiciona correctamente.

***

###Vers. 0.4

**\- Aplicación de correcciones**

1. Ya no aparecen líneas de relleno: el código las identifica por su clase y las elimina.
2. Solucionado bug con los botones de paginación.
3. Cuando una consulta no arroja coincidencias se muestra un mensaje en la tabala.
4. Tanto en la tabla global como en la de consultas, cuando se añade, modifica o borra un elemento, la tabla no cambia de manera que se puede comprobar el cambio (abarca a los puntos 4,5 y 6 de "Testeo y correcciones" de la versión 0.3).
5. Añadido un texto al botón de reset del formulario. También se ha contemplado que la pulsación de Esc (Escape) realice la misma función.
6. El enter/intro ya no es una opción destructiva en las confirmaciones de acciones del usuario.
7. El valor de año de publicación ahora se alamcena como un número de manera que la ordenación de la tabla por dicho campo funciona correctamente.
8. Se ha reducido la altura del formulario para dejar más espacio a la tabla.
9. Solucionado el problema con el botón de cierre de la ayuda.

**\- Formulario y botonera colapsable **

Además de modificar la altura del formulario (ver punto 8 de "Aplicación de correcciones") ahora el formualrio y la botonera se pueden ocultar para visualizar mejor la tabla.
Para ello se ha añadido un botón a la cabecera que al pulsar recoge o despliega el formulario y la botonera.
Esta funcionalidad mejora la usabilidad de la aplicación en dispositivos handheld como móviles y tablets.

**\- Validación HTML y CSS **

* *index.html*: Sólo arroja un error debido al uso del atributo *sort* que es necesario para la funcionalidad de ordenar las filas de la tabla.

    	141	<th sort="isbn" title="Click para ordenar por ISBN">ISBN</th>
		142	<th sort="titulo" title="Click para ordenar por título">TITULO</th>
		143	<th sort="autor" title="Click para ordenar por autor">AUTOR</th>
		144	<th sort="anio" title="Click para ordenar por año de publicación">AÑO</th>
		145	<th sort="editorial" title="Click para ordenar por editorial">EDITORIAL</th>

* *ayuda.html*: OK

* *estilos.css*:OK

* *cssayuda.css*:OK

***

###Vers. 0.5

**\- Detección de desconexión.**

Se ha implementado una librería JavaScript, **[Offline.js](http://github.hubspot.com/offline/docs/welcome/)** para detectar cuando no hay conexión a la red.
Offline.js muestra un mensaje/cuadro superpuesto a la aplicación indicando el estado de conexión. Como estéticamente y funcionalmente, sobre todo para móviles, no nos parecía adecuado, hemos optado por ocultar el cuadro y en función del estado que tenga modificar los botones de la aplicación (Añadir, Modificar, Buscar y Borrar).
De esta manera, cuando no hay conexión, a los botones se les añade un icóno de warning. Al pasar el ratón sobre el botón un mensaje les informará sobre la desconexión.

**\- Código CSS y JavaScript minimizado**
Se han incluido versiones minificadas de los archivos css y js empleados en la aplicación para utilizarlos en "producción".







