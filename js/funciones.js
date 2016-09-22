/*Fecha: 18/07/16
Descripcion: Código JS (JQuery) asociado a index.html para añadir funcionalidad a la página
Autores: Adrián Arteaga, Juan José Basco, Pablo Andueza, Pablo Garrido, Rubén Álvarez
Desarrollado con: Sublime Text 3 (editor) y JQuery*/

/**********************************************************/
/******************* VARIABLES GLOBALES *******************/
/**********************************************************/

//Estructura de datos
var libreria =[]; //array con la estructura de datos

//Estructura de datos para búsquedas en libreria
var busquedas = []; //array para contener resultados de busquedas
var busquedasaux =[]; //array auxiliar empleado en las funciones de busqueda

//Almacenaje de mensajes de error
var arrmensajes=[]; //0: error ISBN; 1 error Título; 2 error Autor; 3 error año; 4 error editorial
var alertmensaje; //En esta variable se montará el mensaje a pasar al usuario en alerta usando el contenido de arrmensajes

//Paginación
var numerodefilas; //una variable que se utilizara en paginación por el fichero externo jTPS.js
var porpagina="8"; // el numero de filas/libros que se muestran por página al iniciar
var arraymostrado = []; // una copia del array de los libros mostrados en cada momento que se utiliza como dato en la paginación

//Flag que índica si la tabla a mostrar es la BD o el resultado de una búsqueda
var busquedaactiva = false;


// pequeña función que se utiliza luego para obtener el numero de elementos de un objeto (se utiliza de cara a la paginación)
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


/**********************************************************/
/****************** REFERENCIAS FIREBASE ******************/
/**********************************************************/

//Referencia a base de datos del proyecto indicado en HTML (si se cambia el código por el de otro proyecto cambia de BD)
var db=firebase.database();
//Referencia a la colección/base de datos concreta que vamos a utilizar
var libreriaDB=db.ref("libreria");



//On-load de JQuery
$(function(){

	//pequeña función que s no hay conexión pinta un icono en llos botones, el detector es una libreria js extena
	var detectarConexion = function() {
	if ( $( ".offline-ui" ).is( ".offline-ui-down" ) ) {
	    $('.icono').html('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>');
	    $('.icono').attr('title', 'Sin conexión de red');
	  } else {
	  	$('.icono').html('');
	  }
	};
	setInterval(detectarConexion, 1000);

	//Inicialización de botones
	//chequeaBotones();

	//Carga en el array librería la BD y lo pinta
	cargaLibreria(libreria);


	/**********************************************************/
	/******************* GESTIÓN DE EVENTOS *******************/
	/**********************************************************/

	//Controla el botón de despliegue del formulario y la botonera
	$('#btnUpDown').click(function(){
		//Si el botón tiene la clase 'fa fa-chevron-circle-up' es que están desplegados
		if ($('#despUpDown').hasClass('fa fa-chevron-circle-up')){
			$('#despUpDown').removeClass('fa fa-chevron-circle-up');
			$('#despUpDown').addClass('fa fa-chevron-circle-down');
			$('#notabla').slideUp('slow');
		//Si no  es que están recogidos
		} else {
			$('#despUpDown').removeClass('fa fa-chevron-circle-down');
			$('#despUpDown').addClass('fa fa-chevron-circle-up');
			$('#notabla').slideDown('slow');
		}
	});
	//Cada vez que se escribe algo en el input o pierde el foco se valida VISUALMENTE
	$("#isbn").bind("input change", validarIsbn);
	$("#isbn").blur(validarIsbn);

	//Cada vez que se escribe algo en el input se valida VISUALMENTE
	$("#titulo").bind("input change", validarTitulo);
	$("#titulo").blur(validarTitulo);

	//Cada vez que se escribe algo en el input se valida VISUALMENTE
	$("#autor").bind("input change", validarAutor);
	$("#autor").blur(validarAutor);

	//Cada vez que se escribe algo en el input se valida VISUALMENTE
	$("#anio").bind("input change", validarAnio);
	$("#anio").blur(validarAnio);

	//Cada vez que se escribe algo en el input se valida VISUALMENTE
	$("#editorial").bind("input change", validarEditorial);
	$("#editorial").blur(validarEditorial);

	//Controla el aspecto del cursor sobre el reset
	$("#resetear").mouseover(function(){
		if (formNoVacio() || $('.mensaje').html()!==''){
			$("#resetear").removeClass('disabled');
		} else {
			$("#resetear").addClass('disabled');
		}
	});

	//Pulsar botón añadir
	$('#anadir').click(function (){
		//Si hay algo seleccionado no se puede añadir porque introduciría una copia en libreria
		//y no es deseable tener entradas duplicadas
		if(!Boolean($('.seleccionado')[0])){alta();}
	});

	//Botón buscar
	$('#buscar').click(function (){
		//Si hay algo seleccionado no se puede añadir porque introduciría una copia en libreria
		//y no es deseable tener entradas duplicadas
		if(!Boolean($('.seleccionado')[0])){
			switch($('#buscar').text()) {
				case 'BUSCAR':
					//Si el formulario está vacío no hay que buscar y por lo tanto tampoco hay que cambiar el botón a 'VOLVER'
					if (formNoVacio()){
						busquedaactiva=true;
						$('#buscar').text('VOLVER');
						busqueda();
					}
					break;
				case 'VOLVER':
					$('#buscar').text('BUSCAR');
					busquedaactiva=false;
					actualizar(libreria);
					break;
			}
		}
	});

/*Un objeto Js es algo así (simplificando) {id: 'linea1', class: 'seleccionado', value: 12 ...}
Un objeto JQ es un objeto que contiene un objeto Js {{objeto Js}, {objeto raruno 1}, {objeto raruno 2} ...}
Un elemento HTML como <tr></tr> es un objeto Js del DOM. Por ej. un <tr id='linea1'></tr> se podría seleccionar en Js
document.getElementById('linea1'), y Boolean(document.getElementById('linea1')) devuelve true porque existe ese <tr>
Si pongo Boolean(document.getElementById('chorizo')) devolverá false porque no hay ningún elemento con ese Id.
Con un objeto JQ puede no pasar esto, puede que creemos un <tr> con id chorizo y luego lo borremos, en ese caso ya no existe
en el DOM pero puede haber todavía un objeto JQ $('#chorizo')={undefined, {objeto raruno 1}, {objeto raruno 2}, ...}
Así que si preguntamos Boolean($('#chorizo')) devuelve true porque el objeto JQ existe. Pero si preguntamos por el primer
elemento del objeto JQ que es el objeto Js real $('#chorizo')[0]=undefined y Boolean(undefined)=false*/

	//Botón modificar
	$('#modificar').click(function(){
		//nos aseguramos que haya una línea seleccionada para poder utilizar el botón
		if(Boolean($('.seleccionado')[0])){modificar();}
	});

	//Botón quitar
	$('#quitar').click(function(){
		//nos aseguramos que haya una línea seleccionada para poder utilizar el botón
		if(Boolean($('.seleccionado')[0])){borrar();}
	});

	//confirm utilizado al resetear para evitar perder modificaciones
	function sweetEscape(){
		swal({	title: "¿Resetear Formulario?",
				text: "Los datos modificados en el formulario se perderán",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Resetear",
				cancelButtonText: "Cancelar",
				closeOnConfirm: true,
				closeOnCancel: true
			},
			//Si el usuario confirma que quiere borrar...
			function(isConfirm){
				if (isConfirm) {
					user=true;
				} else {
					user=false;
				}
				if (user){
	       			$(".seleccionado").removeClass('seleccionado');
	       			limpiaForm();
				}
			}
		);
	}

	//Chequea si lo que hay en el formulario es una modificación
	function prevenirReset(){
		var contenidoForm=objFormulario();
				//Si el formulario no está en blanco y su contenido es distinto de la entrada de libreria
				//significa que el usuario le ha dado a escape después de haber hecho cambios
				//en el formulario (sin pulsar Modificar)
				if (!comparaObj(contenidoForm,libreria[contenidoForm.indice]) && formNoVacio()){
					sweetEscape();
				} else {
					limpiaForm();
				}
	}

	//Botón reset formulario
	$('#resetear').click(function(){
		if (!$('#resetear').hasClass('disabled')){
			prevenirReset();
		}
	});

	//Teclas Escape=resetear; enter no destructivo
	$(document).keyup(function(e) {
	    if (e.keyCode == 27) { // Se ha pulsado Esc (keycode `27`)
		    prevenirReset();
	    }
	    if (e.keyCode == 13) { // se ha pulsado enter/intro (keycode `13`)
		    return false;
	    }
	});

	// El selector de numero de filas por hoja de la paginación
	$('#filasPagina8').click(function(){
		porpagina=8;
		actualizar(arraymostrado);
	});
	$('#filasPagina16').click(function(){
		porpagina=16;
		actualizar(arraymostrado);
	});
	$('#filasPagina32').click(function(){
		porpagina=32;
		actualizar(arraymostrado);
	});
	$('#filasPagina64').click(function(){
		porpagina=64;
		actualizar(arraymostrado);
	});
	$('#filasPaginaAll').click(function(){
		porpagina="All";
		actualizar(arraymostrado);
	});

	$('.filaspPagina span').click(function(){
		$('.filaspPagina span').removeClass('selectPaginas');
		$( this ).addClass( "selectPaginas" );
	});

});

// Funciones del boton ayuda que muestra y oculta la ayuda.
function mostrar(){
document.getElementById('contayuda').style.display = 'initial';
}
function ocultar(){
document.getElementById('contayuda').style.display = 'none';
}


/**************************************************************/
/****************** SUSCRIPCIONES A FIREBASE ******************/
/**************************************************************/

//Con cualquier cambio en la base de datos (modificación, borrado o añdido) se actualiza libreria
libreriaDB.on("child_changed",function(snapshot){
	var dblibro=snapshot.val();
	cambioRemoto(dblibro,Number(dblibro.indice));
	// actualizar(libreria);
});
//"child_added" se rebota ¿?
libreriaDB.on("value",function(addshot){
	var dblibro=addshot.val();
	cargaLibreria(libreria);
	// actualizar(libreria);
});
libreriaDB.on("child_removed",function(snapshot){
	var dblibro=snapshot.val();
	libreria.splice(dblibro.indice, 1);
	//Actualizo los indices de todos sus elementos
	for (var i=0;i<libreria.length;i++){
		libreria[i].indice=i;
	}
	// actualizar(libreria);
});


/***************************************************************/
/********************* FUNCIONES FIREBASE **********************/
/***************************************************************/

//carga la BD en el array que pasemos como argumento, lo normal será librería
function cargaLibreria(parray){
	libreriaDB.once('value', function(snapshot){
		var inicio;
		if (libreria.length !== 0){
			 inicio = false;
		} else {
			 inicio = true;
		}
		var salida=snapshot.val();
		var i,j=0;
		parray.length=0;
		for (i in salida){
			parray[j]=salida[i];
			//La 1ª vez que se añade un dato el atributo iddb='', así que al pasar la BD hay que indicar la key de cada colección
			//que se corresponde a cada objeto almacenado en el array (que hará falta para poder modificar y/o borrar)
			//Como cada vez que se añade una entrada a la BD seguido se actualiza el array, los objetos de este siempre tienen iddb definido
			parray[j].iddb=i;
			//asigno el indice, si no se ha borrado nada será igual, en caso contario se actualizará
			parray[j].indice=j;
			j++;
		}
		//IMPORTANTE!!: la actualización tiene que ir dentro del .once() para sincronizarse
		if (inicio) {
			actualizar(libreria);
		}

	});
}

/*Cuando añadimos un nuevo elemento tenemos dos opciones:
		1.-Añadirlo a la BD, actualizar el array desde la BD y pintar el array
		2.-Añadirlo a la BD y al array, y pintar el array
	La opción 1 tiene un problema, que cuando hay que esperar a que se cargue del todo el array para pintarlo.
	La 2 no tiene ese problema pero el elemento almacenado en el array no tendrá el iddb por lo que no podrá ser
	borrado o modificado de la BD al no tener la clave
	La siguiente función viene a solucionar esto. Usaremos la opción 2, añadiremos a la BD y al array el nuevo
	elemento, con esta función añadiremos en el array la clave iddb, y pintaremos el array*/
function añadeIddb(parray,pindice){
	libreriaDB.once('value').then(function(snapshot){
		var aux=snapshot.val();
		var i,j=0;
		for (i in aux){
			if (j===pindice){
				parray[j].iddb=i;
			}
			j++;
		}
	});
}

function cambioRemoto(pdbobject, pindice){
	var arlibro=libreria[pindice];
	arlibro.indice=pindice;
	arlibro.isbn=pdbobject.isbn;
	arlibro.titulo=pdbobject.titulo;
	arlibro.autor=pdbobject.autor;
	arlibro.anio=pdbobject.anio;
	arlibro.editorial=pdbobject.editorial;
	arlibro.iddb=pdbobject.key;
	// actualizar(libreria);
}


/***************************************************************/
/******************** CONTROLAR LOS BOTONES ********************/
/***************************************************************/

//Esta función comprueba si hay algún elemento con la clase seleccionado
//si lo hay, VISUALMENTE habilita los botones y si no los deshabilita VISUALMENTE
//El control real de habilitación/inhabilitación está en los gestores de evento
function chequeaBotones(){
	var aux=Boolean($('.seleccionado')[0]);
	//Si el array no está vacío Y hay un objeto con .seleccionado
	if (libreria.length!==0 && aux) {
		//Quita la clase Bootstrap disbled para que los botones aparezcan activos
		$('#modificar').removeClass('disabled');
		$('#quitar').removeClass('disabled');
		//añade la clase de Bootstrap disabled para que el botón aparezca desactivado
		$('#anadir').addClass('disabled');
		$('#buscar').addClass('disabled');
	}else{
		$('#modificar').addClass('disabled');
		$('#quitar').addClass('disabled');
		$('#anadir').removeClass('disabled');
		$('#buscar').removeClass('disabled');
	}
}


/*********************************************************/
/******************** PINTAR LA TABLA ********************/
/*********************************************************/

//Se le pasa un objeto del array (un libro) y pinta una línea. pindice es el valor que
//relaciona la fila de la tabla con la posición del objeto en el array
function pintarLinea(pobj){
	//Añadimos onclick="seleccionar(this);" para que podamos seleccionar las líneas de la tabla (con los eventos de JQuery no responden)
	$("#tableta tbody").append('<tr class="linea" onclick="seleccionar(this);"><td>' + pobj.isbn + '</td>' + '<td>' + pobj.titulo + '</td>' + '<td>' + pobj.autor + '</td>' + '<td>' + pobj.anio + '</td>' + '<td>' + pobj.editorial + '</td>' + '<td class="sr-only">' + pobj.indice + '</td></tr>');
}

//Esta función chequea el array y si no está vacío pinta la tabla
//Se ha actualizado con argumentos para poder utilizar la función con el array de librería
//y el que almacena los resultados de búsqueda
function actualizar(parray) {
	//Si el array no está vacío
	if (parray.length !== 0){
		var i;
		//Borro las filas de la tabla
		$('.linea').remove();
		//Borro el aviso de búsqueda por si acaso
		$('#busqueda').text('');
		//Borro el mensaje de búsqueda no encontrada por si acaso
		$('#resultado').text('');
		//Recupero el color de la barra de encabezado normal
		$('th').css('background-color','#B4C9CC');
		//Si el array pasado como argumento es libreria
		if (parray===libreria || busquedaactiva===false){
			//Recorro el array pintando las líneas
			for (i in parray){
				//i es el valor de la posición del array y el contenido de la celda oculta con índice
				pintarLinea(parray[i]);
			}
		arraymostrado = JSON.parse(JSON.stringify(parray)); // para la paginación se necesita sacar una copia del array fuera del ámbito
		numerodefilas = Object.size(arraymostrado); // también para la paginación se necesita este valor que es el numero de elementos (Object.size es una función que sirve para eso)
		$('#tableta').jTPS( {perPages:[porpagina]} ); // se pagina la tabla con el numero de filas por pagina definido (porpagina)
		$('.stubCell').remove(); //Esto borra las líneas que la librería jTPS añade de relleno
		//Si se trata de otro (el de busqueda)
		} else if(busquedaactiva===true){
			//Recorro el array pintando las líneas
			for (i in parray){
				//Paso como valor de la celda oculta el indice que apunta a la posición del elemento en libreria
				//De esta forma si se modifica o borra lo hará correctamente.
				pintarLinea(parray[i]);
			}
			arraymostrado = JSON.parse(JSON.stringify(parray));
			numerodefilas = Object.size(arraymostrado);
			$('#tableta').jTPS( {perPages:[porpagina]} );
			$('.stubCell').remove();
			$('th').css('background-color','#66ffb3');
			$('#busqueda').text('Resultados de la búsqueda');
		}
		//Borro los campos del formulario
		limpiaForm();
	} else {
		//Borro las filas de la tabla porque tiene que estar vacía
		$('.linea').remove();
	}
	//Inicializo el estado VISUAL de los botones
	chequeaBotones();
}


/******************************************************/
/******************** VALIDACIONES ********************/
/******************************************************/

function calculaIsbn10(pisbn){
	var i, cod=0, aux;
	//Paso la cadena a minúsculas ya que un ISBN10 puede acabar en 'x' ó 'X'
	aux=pisbn.toLowerCase();

	/***** Algoritmo de cálculo del 10º dígito de control *****/
	for (i=0; i<(aux.length-1);i++){
		cod = cod + Number(aux[i])*(i+1);
	}
	cod=cod%11;
	//Como trabajo en minúsculas sólo tengo que poner 'x'
	if (cod==10){cod='x';}
	/**********************************************************/

	//Si coincide el código calculado con el que ha introducido el usuario
	if(cod==aux[aux.length-1]){
		return true;
	//Si no coincide
	} else {
		return false;
	}
}

function calculaIsbn13(pisbn){
	var j,cod=0;

	/***** Algoritmo de cálculo del 13º dígito de control *****/
	for (j=1;j<=12;j=j+2){
		cod=cod + Number(pisbn[j])*3 + Number(pisbn[j-1]);
	}
	cod=10-(cod%10);
	/**********************************************************/

	if(cod==Number(pisbn[pisbn.length-1])){
		return true;
	} else {
		return false;
	}
}

//Esta función comprueba la longitud del ISBN y aplica la validación correspondiente
//según sea de 10 o 13 dígitos (supone que la validación de formato ya se ha hecho por
//lo que el argumento sólo puede tener 10 o 13 dígitos)
function contarNumeros(pisbn) {
	 var cuentaNumeros = pisbn.length;
	 var salida;
	 if (cuentaNumeros === 10) {
	 	salida = calculaIsbn10(pisbn);
	 }
	 else if (cuentaNumeros === 13) {
	 	salida = calculaIsbn13(pisbn);
	 }
	 return salida;
}

//NOTA: la validación de esta función sólo se utiliza en Altas, no en modificaciones
//Esta función recorre el array libreria comparando el valor de los ISBN almacenados
//con el del argumento. Si HAY UNA COINCIDENCIA DEVUELVE FALSE (no valido)
function compararisbn(numisbn) {
	var extensionlibre = libreria.length;
	var x = 0;
	for (var i=0; i<extensionlibre; i++) {
		if (libreria[i].isbn.toLowerCase() == numisbn.toLowerCase()) {//123456789X!=123456789x pero 123456789x==123456789x
			//Si hay una coincidencia x=1 y paro de comparar
			x = 1;
			break;
		}
	}
	//En caso de coincidencia
	if (x == 1)	{
		//Pinto el mensaje de error en el campo correspondiente
		$('#isbnnull').html('Ya existe una entrada con este ISBN');
		arrmensajes[0]=' OBLIGATORIO: Ya existe una entrada con este ISBN';
		salida = false;
		$('#isbn').css('border','1px solid red');
		return false;
	} else {
		return true;
	}
}

//Esta función valida el formato y el código de control
function validarIsbn(){
	var mensaje='',salida;
	var reisbn=/^\s*(?:\d{9}[0-9xX]{1}|\d{13})\s*?/g;
	//Elimino posibles espacios en blanco al principio y al final
	//(para el formato no hace falta pero luego si)
	var visbn=($('#isbn').val()).trim();
	//1er Nivel de validación: Formato de ISBN
	if(reisbn.test(visbn)){
		visbn.toLowerCase();
		//2º Nivel de validación: Código de control válido
		if (contarNumeros(visbn)){
				$('#isbn').css('border','1px solid black');
				salida=true;
		}else{
			mensaje=' OBLIGATORIO: ISBN inválido, nro. de control incorrecto';
			$('#isbn').css('border','2px solid red');
			salida=false;
		}
	} else {
		//Sólo pinto el aviso si ya hay campos con datos
		if (formNoVacio()){
			$('#isbn').css('border','2px solid red');
			$('#isbn').css('border','2px solid red');
		}
		mensaje=' OBLIGATORIO: Formato de ISBN inválido 10/13 dígitos';
		salida = false;
	}
		//Sólo pinto el aviso si ya hay campos con datos
		if (formNoVacio()){
			$('#isbnnull').html(mensaje);
		}
		arrmensajes[0]=mensaje;
		return salida;
}

function validarTitulo(){
	var retitulo=/\w+/;
	var vtitulo=($('#titulo').val()).trim();
	if(retitulo.test(vtitulo) && vtitulo!==''){
		$('#titulo').css('border','1px solid black');
		$('#titulonull').html('');
		arrmensajes[1]='';
		return true;
	} else {
		//Sólo pinto el aviso si ya hay campos con datos
		if (formNoVacio()){
			$('#titulo').css('border','2px solid red');
			$('#titulonull').html(' OBLIGATORIO: Título vacío');
		}
		arrmensajes[1]=' OBLIGATORIO: Título vacío';
		return false;
	}
}

function validarAutor(){
	var vautor=($('#autor').val()).trim();
	if(vautor!==''){
		$('#autor').css('border','1px solid black');
		$('#autornull').html('');
		arrmensajes[2]='';
		return true;
	} else {
		//Sólo pinto el aviso si ya hay campos con datos
		if (formNoVacio()){
			$('#autor').css('border','2px solid #a8410f');
			$('#autornull').html(' Autor vacío');
		}
		arrmensajes[2]=' OPCIONAL: Autor vacío';
		return false;
	}
}

function validarAnio(){
	var reanio=/\d{1,4}/;
	var vanio=($('#anio').val()).trim();
	if(reanio.test(vanio)){
		$('#anio').css('border','1px solid black');
		$('#anionull').html('');
		arrmensajes[3]='';
		return true;
	} else {
		//Sólo pinto el aviso si ya hay campos con datos
		if (formNoVacio()){
			$('#anio').css('border','2px solid #a8410f');
			$('#anionull').html(' Año publ. incorrecto: 4 dígitos');
		}
		arrmensajes[3]=' OPCIONAL: Año publ. incorrecto: 4 dígitos';
		return false;
	}
}

function validarEditorial(){
	var veditorial=($('#editorial').val()).trim();
	if(veditorial!==''){
		$('#editorial').css('border','1px solid black');
		$('#editorialnull').html('');
		arrmensajes[4]='';
		return true;
	} else {
		//Sólo pinto el aviso si ya hay campos con datos
		if (formNoVacio()){
			$('#editorial').css('border','2px solid #a8410f');
			$('#editorialnull').html(' Editorial vacía');
		}
		arrmensajes[4]=' OPCIONAL: Editorial vacía';
		return false;
	}
}

//Esta función monta un mensaje de alerta para sacar al usuario en un modal
function montaAlerta(){
	var i;
	alertmensaje='';
	//Si hay mensajes de alerta
	if (arrmensajes.length!==0){
		// alertmensaje='Datos erróneos, corregir:\n';
		for (i in arrmensajes){
			//Si el mensaje no está vacío lo añade
			if (arrmensajes[i]!=='' || arrmensajes[i]!==undefined){
				alertmensaje+=arrmensajes[i] + '\n';
			}
		}
	}
}

//Esta función se llama desde los botones añadir y modificar
function validar(){
	var aux1,aux2,aux3,aux4,aux5,salida={};
	//lo primero asigno el indice oculto
	if ($('#oculto').val()===undefined){
		salida.indice=Number(libreria.length);
	} else {
		salida.indice=Number($('#oculto').val());
	}
	//validar isbn aux1
	aux1=validarIsbn();
	salida.isbn=(aux1 ? $('#isbn').val() : '');
	//validar titulo aux2
	aux2=validarTitulo();
	salida.titulo=(aux2 ? $('#titulo').val() : '');
	//validar autor aux3
	aux3=validarAutor();
	salida.autor=(aux3 ? $('#autor').val() : '');
	//validar año aux4
	aux4=validarAnio();
	salida.anio=(aux4 ? Number($('#anio').val()) : ''); //Uso Number para que la paginación ordene bien
	//validar editorial aux5
	aux5=validarEditorial();
	salida.editorial=(aux5 ? $('#editorial').val() : '');
	/*PARA ENTENDERNOS: iddb es a la BD de Firebase lo que indice es al array libreria*/
	salida.iddb='';//en este atributo se alamacena la key de la colección que almacenará salida
	//Validacion global
	//Si los campos obligaotios CUMPLEN
	if (aux1 && aux2){
		return salida;
	}
	//Si los campos obligatorios NO CUMPLEN
	else {
		return null;
	}
}


/*****************************************************************/
/******************** SELECCIONAR DE LA TABLA ********************/
/*****************************************************************/

//Deja el formulario en blanco y elimina los errores
//La utilizan: seleccionar, actualizar
function limpiaForm(){
	$('input').val('');
	$('input').css('border', '1px solid black');
	//La clase mensaje corresponde sólo a los span de validación
	$('.mensaje').html('');
	$('tr').removeClass('seleccionado');
	chequeaBotones();
	arrmensajes.length=0;
}

//Esta función monta un objeto con el contenido de los campos del formulario sin validacion
//La utilizan: seleccionar
function objFormulario(){
	var salida={};
	//lo primero asigno el indice oculto
	if ($('#oculto').val()===undefined){
		salida.indice=libreria.length;//Si no hay indice en oculto es porque se trata de una nueva entrada
	} else {
		//El índice obtenido del formulario es un string
		salida.indice=Number($('#oculto').val());
	}
	salida.isbn=$('#isbn').val();
	salida.titulo=$('#titulo').val();
	salida.autor=$('#autor').val();
	salida.anio=Number($('#anio').val());
	salida.editorial=$('#editorial').val();
	salida.iddb='';//en este atributo se alamacena la key de la colección que almacenará salida
	/*PARA ENTENDERNOS: iddb es a la BD de Firebase lo que indice es al array libreria*/
	return salida;
}

//Comprueba si NO TODOS los campos del formulario están vacios
//La utiliza: seleccionar
function formNoVacio(){
	//Concateno el contenido de texto de todos los campos y compruebo que si el resultado es una cadena vacía ''
	var cadena=$('#isbn').val()+$('#titulo').val()+$('#autor').val()+$('#anio').val()+$('#editorial').val();
	/*cadena.trim() elimina espacios en blanco antes y después del texto de manera que '  hola   '->'hola'=no vacío
	y '       '->''=vacío*/
	if(cadena.trim() === ''){return false;}else{return true;}
}

//Compara los 6 primeros atributos de 2 objetos para ver si son iguales (devuelve true)
//Esta función se ha creado porque los objetos de formulario y libreria NO SON EXACTAMENTE iguales en estructura
//La utilizan: seleccionar
function comparaObj(pobj1,pobj2){
	var salida;
	var i,j=0;
	if (pobj2!==undefined){ //pobj2 viene de objFormulario, si el formulario está vacío pobj2 ~=undefined
		for (i in pobj1){
			if (j>=6){break;}
			if (pobj1[i]!==pobj2[i]){
				salida=false;
				break;
			} else {
				salida=true;
			}
			j++;
		}
	} else {
		salida=true;//Cualquier comparación con un registro undefined se considera true
	}
	return salida;
}

//Cuando se ha seleccionado una línea y se modifica en el formulario, si antes de darle a "Modificar" se vuelve
//a seleccionar otra línea, se pide al usuario que confirme si desea continuar. Esta función es el aviso.
function sweetConfirm(pobj){
	swal({	title: "¿Nueva selección?",
			text: "Los datos modificados en el formulario se perderán",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Seleccionar",
			cancelButtonText: "Cancelar",
			closeOnConfirm: true,
			closeOnCancel: true
		},
		//Si el usuario confirma que quiere borrar...
		function(isConfirm){
			if (isConfirm) {
				user=true;
			} else {
				user=false;
			}
			if (user){
				//Deselecciono cualquier tr (le quito la clase 'seleccionado')
				$('tr').removeClass('seleccionado');
				//Borra span de errores
				$('.mensaje').html('');
				//Pone los bordes de inputs bien
				$('input').css('border', '1px solid black');
				//Selecciono el clickado
				$(pobj).addClass('seleccionado');
				var i,arraux=[];
				//en un array auxiliar cargo el contenido de cada celda de la línea .seleccionado
				for (i=1;i<=6;i++){
				arraux.push($('.seleccionado :nth-of-type(' + i + ')').text());
			}
			//Paso el contenido de cada celda a los inputs del formulario
			$('#isbn').val(arraux[0]);
			$('#titulo').val(arraux[1]);
			$('#autor').val(arraux[2]);
			$('#anio').val(arraux[3]);
			$('#editorial').val(arraux[4]);
			$('#oculto').val(arraux[5]);
			//Para que funcione pintaBotones()
			//seleccionado=true;
			}
		}
	);
}

//pobj corresponde al <tr> sobre el que se ha hecho click
function seleccionar(pobj){
	var user;
	//Si la línea está seleccionada la deselecciono
	if ((pobj.getAttribute('class')).indexOf('seleccionado')!==-1) {
		$(pobj).removeClass('seleccionado');
		limpiaForm();
		chequeaBotones();
	}
	//En caso contrario
	else {
		var contenidoForm=objFormulario();
		//Si el formulario no está en blanco y su contenido es distinto de la entrada de libreria
		//significa que el usuario ha realizado una nueva selección después de haber hecho cambios
		//en el formulario (sin pulsar Modificar)
		if (!comparaObj(contenidoForm,libreria[contenidoForm.indice]) && formNoVacio()){
			// user=confirm('Si realiza una nueva selección perderá los cambios \n ¿Desea continuar?');
			sweetConfirm(pobj);
		} else {
			user=true;
		}
		if (user){
			//Deselecciono cualquier tr (le quito la clase 'seleccionado')
			$('tr').removeClass('seleccionado');
			//Borra span de errores
			$('.mensaje').html('');
			//Pone los bordes de inputs bien
			$('input').css('border', '1px solid black');
			//Selecciono el clickado
			$(pobj).addClass('seleccionado');
			var i,arraux=[];
			//en un array auxiliar cargo el contenido de cada celda de la línea .seleccionado
			for (i=1;i<=6;i++){
				arraux.push($('.seleccionado :nth-of-type(' + i + ')').text());
			}
			//Paso el contenido de cada celda a los inputs del formulario
			$('#isbn').val(arraux[0]);
			$('#titulo').val(arraux[1]);
			$('#autor').val(arraux[2]);
			$('#anio').val(arraux[3]);
			$('#editorial').val(arraux[4]);
			$('#oculto').val(arraux[5]);
			//Para que funcione pintaBotones()
			//seleccionado=true;
		}
	}
	chequeaBotones();
}


/**************************************************************************/
/******************** ACCIONES ASOCIADAS A LOS BOTONES ********************/
/**************************************************************************/

function alta() {
	$('#oculto').val(libreria.length);
	var nuevodato = validar();
	//La validación global de ISBN sólo comprueba el número, antes de añadirlo al array
	//hay que ver si ya existe un elemento con ese ISBN
	var aux=compararisbn($('#isbn').val());
	if (nuevodato && aux) {
		//Indice de de libreria donde se añadirá el nuevo elemento
		nindice = libreria.length;
		//Se añade a libreria (sin el iddb)
		libreria[nindice] = nuevodato;
		//Se añade a la BD
		libreriaDB.push(nuevodato, function(){
			//Actualizo el iddb del nuevo elemento en libreria
			añadeIddb(libreria,nindice);
			//Pinto la tabla basándome en libreria
			actualizar(libreria);
			$('.pageSelector:last').click();
		});
	} else {
		montaAlerta();
		sweetAlert('Datos erróneos, corregir:',alertmensaje);
	}
}

function modificar() {
	//Al modificar no hay que comprobar si el elemento tiene el mismo ISBN porque es él mismo
	datomodificado = validar();
	if (datomodificado) {
		//El atributo indice de nuevo dato contiene el índice para almacenar en el array
		aindice = datomodificado.indice;
		//Asigno el iddb que hay en el array al objeto creado para completarlo
		datomodificado.iddb=libreria[aindice].iddb;
		//Modifico el array
		libreria[aindice] = datomodificado;
		//Modifico la BD
		db.ref('libreria/'+libreria[aindice].iddb).set(datomodificado);
		//Pinto la tabla
		if (busquedaactiva===true) {
			for (var i in busquedas) {
				if (busquedas[i].indice == aindice) {
					busquedas[i] = datomodificado;
				}
			}
			$(".seleccionado").html('<td>' + datomodificado.isbn + '</td>' + '<td>' + datomodificado.titulo + '</td>' + '<td>' + datomodificado.autor + '</td>' + '<td>' + datomodificado.anio + '</td>' + '<td>' + datomodificado.editorial + '</td>' + '<td class="sr-only">' + datomodificado.indice + '</td>');
	 		$(".seleccionado").removeClass('seleccionado');
			limpiaForm();
		} else {
			$(".seleccionado").html('<td>' + datomodificado.isbn + '</td>' + '<td>' + datomodificado.titulo + '</td>' + '<td>' + datomodificado.autor + '</td>' + '<td>' + datomodificado.anio + '</td>' + '<td>' + datomodificado.editorial + '</td>' + '<td class="sr-only">' + datomodificado.indice + '</td>');
	 		$(".seleccionado").removeClass('seleccionado');
			limpiaForm();
		}
	} else {
		montaAlerta();
		var a=sweetAlert('Datos erróneos, corregir:',alertmensaje);
	}
	chequeaBotones();
}

function borrar() {
	swal({	title: "¿Está seguro?",
			text: "La entrada de la base de datos no se podrá recuperar",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Si, bórralo",
			cancelButtonText: "Cancelar",
			closeOnConfirm: true,
			closeOnCancel: true },
			//Si el usuario confirma que quiere borrar...
			function(isConfirm){
				if (isConfirm) {
					var eindice = $("#oculto").val();
					var i;
					/*PRIMERO borrar en la BD*/
					//elementkey se carga con el iddb para saber que colección de DB tengo que borrar
					var elementkey=libreria[eindice].iddb;
					//Borro el elemento/libro de la BD
					db.ref('libreria/'+elementkey).remove();
					/*SEGUNDO borrar en libreria*/
					//Borro el elemento del array librería
					libreria.splice(eindice, 1);
					//Actualizo los indices de todos sus elementos
					for (i=0;i<libreria.length;i++){
						libreria[i].indice=i;
					}
					//Borro la linea
					$(".seleccionado").remove();
					limpiaForm();
				}
			}
	);
}

/******************************************************************/
/******************** FUNCIONES PARA BUSQUEDAS ********************/
/******************************************************************/

function busqueda() {
	busquedas = []; // se inicializan a cero aquí pero se declaran fuera porque se utilizan en otra función
	busquedasaux =[]; // se inicializan a cero aquí pero se declaran fuera porque se utilizan en otra función
	var aux;
	var textobusca;
	$('#resultado').text('');
	/* sinencontrar: tras una búsqueda sin resultado (de por ejemplo el autor) el valor de sinencontrar sera true para evitar
	realizar más búsquedas (si no encuentra el autor no queremos que siga buscando desde los textos de los imputs
	y añada por ejemplo todos los libros que coinciden con el año)*/
	var sinencontrar = false;

	if ($('#isbn').val()) {
		busquedasactuales = busquedas.length;
		/*si no hay resultados de búsquedas previas (realizadas siguiendo otros imputs) y no es porque no se han encontrado
		sino porque no se han hecho búsquedas entonces se busca en el array libreria:*/
		if (busquedasactuales===0 && sinencontrar===false) {
			textobusca = $('#isbn').val();
			abuscar("isbn", textobusca);
		// si ya hay resultados de búsqueda se busca en el array de resultados para continuar filtrando:
		} else if (busquedasactuales>0){
			abuscarb("isbn", textobusca);
		}
	}

	if ($('#titulo').val()) {
		busquedasactuales = busquedas.length;
		if (busquedasactuales===0 && sinencontrar===false) {
			textobusca = $('#titulo').val();
			abuscar("titulo", textobusca);
		} else if (busquedasactuales>0){
			textobusca = $('#titulo').val();
			abuscarb("titulo", textobusca);
		}
	}

	if ($('#autor').val()) {
		busquedasactuales = busquedas.length;
		if (busquedasactuales===0 && sinencontrar===false) {
			textobusca = $('#autor').val();
			abuscar("autor", textobusca);
		} else if (busquedasactuales>0){
			textobusca = $('#autor').val();
			abuscarb("autor", textobusca);
		}
	}

	if ($('#anio').val()) {
		busquedasactuales = busquedas.length;
		if (busquedasactuales===0 && sinencontrar===false) {
			textobusca = $('#anio').val();
			abuscar("anio", textobusca);
		} else if (busquedasactuales>0){
			textobusca = $('#anio').val();
			abuscarb("anio", textobusca);
		}
	}

	if ($('#editorial').val()) {
		busquedasactuales = busquedas.length;
		if (busquedasactuales===0 && sinencontrar===false) {
			textobusca = $('#editorial').val();
			abuscar("editorial", textobusca);
		} else if (busquedasactuales>0){
			textobusca = $('#editorial').val();
			abuscarb("editorial", textobusca);
		}
	}

	actualizar(busquedas);
}

// función con la que se buscaran los primeros resultados la primera vez (utilizando como filtrado del primer imput que tenga algo de texto)
function abuscar (dondebusco, quebusco) {
	librosactuales = libreria.length;
	for (i=0; i<librosactuales; i++) {
		/*si el contenido de quebusco forma parte de lo que hay en el contenido dondebusco (es decir no tiene que por ser igual solo formar
		parte, una parte) dará un valor mayor a -1 y entonces ejecutara lo siguiente:*/
		if (libreria[i][dondebusco].toLowerCase().indexOf(quebusco.toLowerCase()) != -1) {
				busquedas.push(libreria[i]);
		}
	}
	if (busquedas.length === 0) {
		/*una variable importante para poder diferenciar casos en los que el array de búsquedas esta vació pero porque no se ha hecho ninguna
		búsqueda de los casos en el que el array esta vació pero porque no ha encontrado nada (en este ultimo caso no se harán mas búsquedas)*/
		sinencontrar = true;
		$("#tableta tbody").append('<tr><td colspan="5" id="resultado" style="background-color: white;">No encontramos libros que coincidan con los valores introducidos</td></tr>');
		$('#busqueda').text('Resultados de la búsqueda');
		$('th').css('background-color','#66ffb3');
	}
}

/*la función abuscarb se activara cuando ya se haya hecho una búsqueda inicial y, tras encontrarse algo, se haya añadido algún elemento al
array de búsquedas pues la búsqueda ahora se hará sobre este ultimo array y no sobre todo el array de libreria*/
function abuscarb (dondebusco, quebusco) {
	busquedasaux =[]; //se pone a cero para eliminar cualquier valor de búsquedas anteriores mediante esta misma función.
	busquedasactuales = busquedas.length;
	for (var t=0; t<busquedasactuales; t++) { // se busca sobre lo a buscado para seguir filtrando
		if (busquedas[t][dondebusco].toLowerCase().indexOf(quebusco.toLowerCase()) != -1) {
			busquedasaux.push(busquedas[t]); // se añaden los elementos que coinciden en un array auxiliar (busquedasaux)
		}
	}
	/*se hace un volcado total o copia del array auxiliar en el array búsquedas. Hay que hacerlo de esta manera porque si se hace mediante
	una igualación no se copia sino que el array de la izquierda solo seria una referencia más a los datos que ya referencia el array de la derecha.*/
	busquedas = JSON.parse(JSON.stringify(busquedasaux));
	if (busquedas.length === 0) {
		$('#resultado').text("No encontramos libros que coincidan con los valores introducidos");
		$('#busqueda').text('Resultados de la búsqueda');
		$('th').css('background-color','#66ffb3');
	}
}



/*******************************************************************/
/******************** FUNCIONES PARA DESARROLLO ********************/
/*******************************************************************/
/* Estas funciones están comentadas para que al minificar el JS no se añadan
function numeroAzar(){
	var a=Math.round((Math.random() * 10));
	if(a===10){a=9;}
	return a;
}
var arrisbn=['123456789X','1234567890128','1111111111116','1212121212128','1452367892','9999999999','4561597530','951357654x','258456159x','7531598523'];
var arrtitulo=['JQuery y tú','El linter, tu gran amigo','100 razones para odiar IE','Oda al pantallazo azul','El Señor de los gramillos','Mucho ruido y pocos altramuces','LSD y programación','10 pasos para desengancharte del código','Guerra y Paz III','Cumbres con nubes y claros'];
var arrautor=['Guillermo Puertas','Java El Hutt','León Tostón','Alan Turning','Adrián Arteaga', 'Juan José Basco', 'Pablo Andueza','Pablo Garrido','Rubén Álvarez','Chespirito'];
var arranio=['1234','5678','9123','2016','1975','1981','1732','2222','1997','2010'];
var arreditorial=['Satelite','Bruguerra','Chonibooks','Mocosoft','Ran-Ma','Livros pa\' que','Editorial','Exoplaneta','Macgrou Jill','Salbamé Delujs'];

//Genera un array de prueba
function cargaDB(){
	var i=libreria.length;
	var salida={
		indice: i,
		isbn: arrisbn[i],
		titulo: arrtitulo[numeroAzar()],
		autor: arrautor[numeroAzar()],
		anio: arranio[numeroAzar()],
		editorial: arreditorial[numeroAzar()],
		iddb: ''
	};
	libreria[i]=salida;
	libreriaDB.push(libreria[i]);
}*/

