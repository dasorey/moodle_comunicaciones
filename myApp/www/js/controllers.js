/* global angular */
angular.module('starter.controllers', ['ionic'])

	.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $window, $rootScope, $ionicPopup, $cordovaTouchID, $ionicSideMenuDelegate) {
		// Form data for the login modal

		$rootScope.puedoVerCalendario = false;
		$rootScope.dedo = false;
		$scope.verCalendario = function () {
			$rootScope.puedoVerCalendario = false;
		};

		$scope.verificarDedo = function () {
			$cordovaTouchID.authenticate("Por favor verifique su identidad").then(function () {
				window.localStorage['pulgar'] = "pedirDedo";
				window.localStorage['usuarioTouchID'] = $rootScope.username;
				window.localStorage['passwordTouchID'] = $rootScope.password;
			}, function (error) {
				window.localStorage['pulgar'] = "noPedirDedo";
			});
		}

		$scope.comprobarActivadoDedo = function () {
			if ((window.localStorage['usuarioTouchID'] == $rootScope.username) && (window.localStorage['passwordTouchID'] == $rootScope.password)) {
				return true;
			} else {
				return false;
			}
		}

		$scope.alerta = function (check) {
			if (check) {
				var confirmPopup = $ionicPopup.confirm({
					title: 'Touch ID',
					subTitle: '¿Desea activar el Touch ID?',
					template: 'Se añadirá una capa de seguridad extra en su inicio de sesión para que solo usted pueda acceder con su cuenta',
					cancelText: 'No',
					okText: 'Sí',
					okType: 'button-balanced',
					cancelType: 'button-energized'
				});
				confirmPopup.then(function (res) {
					if (res) {
						$scope.verificarDedo();
					} else {
						$window.alert("El dedo no funciona");
					}
				});
			} else {
				window.localStorage['pulgar'] = "noPedirDedo";
				window.localStorage['usuarioTouchID'] = "";
				window.localStorage['passwordTouchID'] = "";
			}
		}

	})

	.controller('LoginInicio', function ($scope, $window, $state, $location, $rootScope, $ionicSideMenuDelegate, $http, $ionicLoading, $ionicPopup, $ionicPlatform, $cordovaTouchID, $cordovaDevice) {

		$ionicSideMenuDelegate.canDragContent(false);

		$scope.datosServidor = {};
		$scope.verURL = false;

		$scope.guardarURL = function (servidor) {
			var posicion = servidor.indexOf('http://'); e
			$rootScope.url = "";
			if (posicion == 0) {
				$rootScope.url = servidor;
				window.localStorage['url'] = $rootScope.url;
			} else if (posicion == -1) {
				$rootScope.url = 'http://' + servidor;
				window.localStorage['url'] = $rootScope.url;
			} else {
				var alertPopup = $ionicPopup.alert({
					title: 'Error en la url',
					template: '<p style="text-align:center;">La dirección que ha introducido no es una URL válida.</p>',
					okText: 'Aceptar',
					okType: 'button-assertive'
				});
				$scope.verURL = false;
			}


		}

		$scope.verificarDedo = function () {
			$cordovaTouchID.authenticate("Por favor verifique su identidad").then(function () {
				if ((window.localStorage['nombre'] != $scope.datosUsuario.username) || (window.localStorage['contrasena'] != $scope.datosUsuario.password)) {
					$scope.showConfirm();
				} else {
					$scope.loguearse2();
				}
			}, function (error) {
			});
		}

		$scope.comprobarPlataforma = function () {
			$rootScope.platform = 'Android';
			return false;
		}

		$scope.comprobarInicio = function () {
			if (window.localStorage['nombre'] != null) {
				$scope.usuarioLocal = window.localStorage['nombre'];
				return true;
			} else {
				return false;
			}
		}

		$scope.loguearse = function () {
			//Voy a comprobar si tiene soporte para Touch ID

			$scope.guardarURL($scope.datosUsuario.servidor);
			if ($rootScope.platform != "Android") {
				window.alert("Entro dentro del if");
				$cordovaTouchID.checkSupport().then(function () {
					//Si el usuario tiene soporte activamos el menú lateral
					$rootScope.dedo = true;

					//Compruebo si el usuario tiene configuarado el Touch ID
					if ((window.localStorage['usuarioTouchID'] == $scope.datosUsuario.username) && (window.localStorage['passwordTouchID'] == $scope.datosUsuario.password)) {

						$scope.verificarDedo();

					} else {

						//El usuario no tiene activado el Touch ID
						if ((window.localStorage['nombre'] != $scope.datosUsuario.username) || (window.localStorage['contrasena'] != $scope.datosUsuario.password)) {
							$scope.showConfirm();
						} else {
							$scope.loguearse2();
						}
					}
				}, function (error) {
					//El usuario no tiene soporte
					if ((window.localStorage['nombre'] != $scope.datosUsuario.username) || (window.localStorage['contrasena'] != $scope.datosUsuario.password)) {
						$scope.showConfirm();
					} else {
						$scope.loguearse2();
					}
				});
			} else {
				if ((window.localStorage['nombre'] != $scope.datosUsuario.username) || (window.localStorage['contrasena'] != $scope.datosUsuario.password)) {
					$scope.showConfirm();
				} else {
					$scope.loguearse2();
				}
			}
		}


		var hide = function () {
			$ionicLoading.hide();
		};

		$scope.nombreDelUsuario = window.localStorage['nombre'] || "";
		$scope.contrasenaDelUsuario = window.localStorage['contrasena'] || "";
		$scope.url = window.localStorage['url'] || "";

		$scope.showConfirm = function () {
			var confirmPopup = $ionicPopup.confirm({
				title: 'Contraseña',
				template: '¿Desea que la aplicación almacene su usuario y contraseña?',
				cancelText: 'No',
				okText: 'Sí',
				okType: 'button-balanced',
				cancelType: 'button-energized'
			});
			confirmPopup.then(function (res) {
				if (res) {
					window.localStorage['nombre'] = $scope.datosUsuario.username;
					window.localStorage['contrasena'] = $scope.datosUsuario.password;
					$scope.loguearse2();
				} else {
					window.localStorage['nombre'] = "";
					window.localStorage['contrasena'] = "";
					$scope.loguearse2();
				}
			});
		};


		$scope.loguearse2 = function () {

			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Verificando...',
				animation: 'fade-in',
				showBackdrop: false
			});

			$rootScope.username = $scope.datosUsuario.username;
			$rootScope.password = $scope.datosUsuario.password;
			$http.get($rootScope.url + '/login/token.php?username=' + $scope.datosUsuario.username + '&password=' + $scope.datosUsuario.password + '&service=local_mobile').
				success(function (data) {
					if (data.token != null) {
						$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + data.token + '&wsfunction=moodle_webservice_get_siteinfo&moodlewsrestformat=json').
							success(function (info) {
								$rootScope.token = data.token;
								var urlfoto = info.siteurl + "/webservice" + (info.userpictureurl).substr(info.siteurl.length) + "?token=" + data.token;
								$rootScope.usuario = info;
								$rootScope.usuario.userpictureurl = urlfoto;
								$rootScope.data = {};
								var posicionContexto = (info.userpictureurl).indexOf("php/") + 4;
								$rootScope.contextoUsuario = (info.userpictureurl).substr(posicionContexto, (info.userpictureurl).indexOf("/user") - posicionContexto);
								obtenerCurso(data.token, info.userid);
								$state.go("app.cursos");
								$scope.verURL = false;
							}).
							error(function (data, status, headers, config) {
								hide();
								var alertPopup = $ionicPopup.alert({
									title: 'Error al iniciar sesión',
									template: '<p style="text-align:center;">No ha sido posible obtener sus datos de usuario, inténtelo más tarde.</p>',
									okText: 'Aceptar',
									okType: 'button-assertive'
								});
								$state.go("app.servidor");
							});
					} else {
						var alertPopup = $ionicPopup.alert({
							title: 'Error al iniciar sesión',
							template: '<p style="text-align:center;">Compruebe que el usuario y la contraseña son correctos.</p>',
							okText: 'Aceptar',
							okType: 'button-assertive'
						});
						hide();
					}

				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">El servidor que ha introducido no responde. Compruebe que lo ha escrito bien.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
					$state.go("app.servidor");
				});

		};



		var obtenerCurso = function (token, id) {
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + token + '&wsfunction=moodle_user_get_users_by_id&moodlewsrestformat=json&userids[0]=' + id).
				success(function (infoUsuario) {
					$rootScope.localidad = infoUsuario[0].city + ", " + infoUsuario[0].country;
					$rootScope.enrolledcourses = infoUsuario[0].enrolledcourses;
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">No ha sido posible obtener los cursos en los que está matriculado.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
					$state.go("app.servidor");
				});
		};

		$scope.pasar_informacion = function (curso, data) {
			$rootScope.data = curso;
			$rootScope.puedoVerCalendario = true;
		};

	})

	.controller('CursoDetalle', function ($scope, $window, $stateParams, $ionicSideMenuDelegate, $anchorScroll, $location, $rootScope, $http, $ionicLoading, $sce, $templateCache) {

		$ionicSideMenuDelegate.canDragContent(true);
		$rootScope.userCurso = {};
		$rootScope.UsuarioAutorizado = 0

		$scope.unidad = function (text) {
			var posicion = String(text).indexOf(". ");
			if (posicion > 0) {
				return String(text).substring(0, posicion);
			} else {
				return text;
			};
		}
		$scope.tituloUnidad = function (text) {
			var posicion = String(text).indexOf(". ");
			if (posicion > 0) {
				return String(text).substring(posicion + 2);
			} else {
				return "";
			}
		}

		var hide = function () {
			$ionicLoading.hide();
		};

		$rootScope.$watch('data', function () {
			$scope.color = [true, false, false];
			obtenerContenidoCurso($rootScope.token, $rootScope.data.id);
		})

		$rootScope.unidadaMostrar = 0;

		$scope.verUnidad = function (id) {
			if ($rootScope.unidadMostrar == id) {
				$rootScope.unidadMostrar = 0;
			} else {
				$rootScope.unidadMostrar = id;
			}
		}

		var obtenerContenidoCurso = function (token, id) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Cargando contenido...'
			});
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + token + '&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=' + id).
				success(function (contenidoCurso) {
					$scope.foros = contenidoCurso[2];
					$scope.recursos = contenidoCurso[1];
					$scope.teoria = contenidoCurso;
					$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + token + '&wsfunction=local_mobile_get_completion_data&moodlewsrestformat=json&courseid=' + id + '&userid=' + $rootScope.usuario.userid).
						success(function (completo) {
							$rootScope.estadoActividad = completo;
							hide();
						}).
						error(function (data, status, headers, config) {
							hide();
							var alertPopup = $ionicPopup.alert({
								title: 'Error al iniciar sesión',
								template: '<p style="text-align:center;">No se ha podido obtener el estado de la actividad.</p>',
								okText: 'Aceptar',
								okType: 'button-assertive'
							});
						});

				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">No ha sido posible obtener el contenido de su curso, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
				
			//var grupoGeneral = {'id':0, 'name':'Grupo general', 'description':"", 'descriptionformat':1};
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + token + '&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=' + id).
				success(function (usuariosCurso) {
					$rootScope.usuariosDelCurso = usuariosCurso;
					$rootScope.userCurso = {};
					$rootScope.UsuarioAutorizado = 0;
					$rootScope.notas = {};
					$rootScope.notasProfesor = {};
					angular.forEach(usuariosCurso, function (usuario) {
						if (usuario.id == $rootScope.usuario.userid) {
							$rootScope.userCurso = usuario;
							angular.forEach($rootScope.userCurso.roles, function (rolle) {
								if ((rolle.roleid < 5) || (rolle.roleid == 13)) {
									$rootScope.UsuarioAutorizado = 1;
								}
							});

						}
					});
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">No ha sido posible obtener los usuarios que están matriculados en su curso.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		};


		$scope.verRecurso = function (recursoId) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Cargango contenido...'
			});
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_mod_forum_get_forums_by_courses&moodlewsrestformat=json&courseids[0]=' + $rootScope.data.id).
				success(function (foros) {
					angular.forEach(foros, function (foro) {
						if (foro.cmid == recursoId) {
							obtenerEntradasForo(foro.id);
						}
					})
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">No ha sido posible obtener los foros pertenecientes a su curso, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		};

		var obtenerEntradasForo = function (id) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Cargango contenido...'
			});
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_mod_forum_get_forum_discussions_paginated&moodlewsrestformat=json&forumid=' + id).
				success(function (entradasForo) {
					angular.forEach(entradasForo.discussions, function (entradas) {
						$scope.abrirContenido("1", entradas.name + entradas.usermodifiedfullname, "1");
					})
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">No ha sido posible obtener las entradas del foro, por favor inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		};

		$scope.getClass = function (tipoContenido) {
			if (tipoContenido == "contenidos") {
				return ("md md-insert-drive-file");
			} else if (tipoContenido == "quiz") {
				return ("md md-border-color");
			} else if (tipoContenido == "label") {
				return ("md md-flag");
			} else if (tipoContenido == "adobeconnect") {
				return ("md md-voice-chat");
			} else if (tipoContenido == "resource") {
				return ("md md-attachment");
			} else if (tipoContenido == "forum") {
				return ("md md-forum");
			} else if (tipoContenido == "url") {
				return ("md md-explore");
			} else if (tipoContenido == "chat") {
				return ("md md-chat");
			} else {
				return ("md md-error");
			}
		}

		$scope.toggleLeft = function () {
			$ionicSideMenuDelegate.toggleLeft();
		}

		$scope.mostrar_apartado = function (col) {
			if (col == "col1") {
				$scope.color = [true, false, false];
			} else if (col == "col2") {
				$scope.color = [false, true, false];
			} else if (col == "col3") {
				$scope.color = [false, false, true];
			}
		}

		$rootScope.$watch('unidad', function () {
			$location.hash($rootScope.unidad);
			$anchorScroll();
		});

		var loadScript = function (texto) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.innerHTML = texto;
			document.body.appendChild(script);
		}

		var ref = null;


		$scope.abrirContenido = function (url) {

			ref = window.open(encodeURI(url), "_blank", 'location=no,closebuttoncaption=Cerrar,enableViewportScale=no, hidden=yes');
			ref.addEventListener('loadstart', function () {
				ref.insertCSS({ code: "#page{display: none !important;}" });
			});
			ref.addEventListener('loadstop', function () {
				ref.insertCSS({ code: "body {background: white !important;} header {display: none  !important;} #page-footer {display: none  !important;} #block-region-side-pre {display: none  !important;} #page-navbar {display: none  !important;} #newmessageoverlay {display: none  !important;} .contenidos-botonera {display: none  !important;}" });
				ref.executeScript({ code: "var elem = document.getElementById('username');elem.value = '" + $rootScope.username + "';var pass = document.getElementById('password'); pass.value = '" + $rootScope.password + "'; document.getElementById('login').submit();" });

			});

		}

		$scope.comprobarCompleto = function (id) {
			var res = 0;
			angular.forEach($rootScope.estadoActividad, function (actividad) {
				if (actividad.id == id) {
					res = actividad.completion;
				}
			});
			return res;
		}

	})

	.controller('Leccion', function ($scope, $rootScope, $ionicSideMenuDelegate, $sce, $window, $ionicLoading) {

		$scope.numeroIntentos = 3;
		$scope.examen = $sce.trustAsHtml('<h3>Pregunta 1</h3>' +
			'<p>Texto de la pregunta, que escribo vagamente para que ocupe unas cuantas líneas y así comprobar el formato de párrafo.</br></p>' +
			'<form>Seleccione una:</br><input type="radio" name="opcion" value="opcion1"><label>Opción 1</label><br>' +
			'<input type="radio" name="opcion" value="opcion2"><label for="id2">Opción 2</label><br>' +
			'<input id="id3" type="radio" name="opcion" value="opcion3"><label>Opción 3</label><br>' +
			'</form>');


		$rootScope.$watch('titulo', function () {
			if ($rootScope.titulo == "Contenido") {
				$scope.tipoContenido = [true, false, false, false];
			} else if ($rootScope.titulo == "Actividad") {
				$scope.tipoContenido = [false, true, true, false];
			}
		});

		$scope.toggleLeft = function () {
			$ionicSideMenuDelegate.toggleLeft();
		}

		$scope.volverUnidad = function (unidad) {
			$rootScope.unidad = unidad;
		}

		$scope.comenzarActividad = function () {
			$scope.numeroIntentos = $scope.numeroIntentos - 1;
			$scope.tipoContenido = [false, true, false, true];
		}

	})

	.controller('Mensajes', function ($scope, $rootScope, $ionicSideMenuDelegate, $sce, $window, $http, $ionicScrollDelegate, $interval, $ionicActionSheet, $ionicModal, $ionicLoading) {

		$scope.mensajeDeEnvio = "";
		$ionicSideMenuDelegate.canDragContent(true);

		var hide = function () {
			$ionicLoading.hide();
		};

		$scope.toggleLeft = function () {
			$ionicSideMenuDelegate.toggleLeft();
		}

		$scope.htmlToPlaintext = function (text) {
			return String(text).replace(/<[^>]+>/gm, '');
		}

		$scope.showModal = function (templateUrl) {
			$ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}

		// Close the modal
		$scope.closeModal = function () {
			$scope.modal.hide();
			$scope.modal.remove()
		};

		$scope.gestionUsuarios = function () {

			$ionicActionSheet.show({
				//titleText: 'Opciones',
				buttons: [{ text: 'Añadir Contacto' }, { text: 'Eliminar Contacto' }],
				cancelText: 'Cancelar',
				cancel: function () { },
				buttonClicked: function (index) {
					if (index == 0) {
						$scope.showModal('templates/anhadir_contacto.html');
					} else if (index == 1) {
						$scope.showModal('templates/eliminar_contacto.html');
					}
					return true;
				},
				destructiveButtonClicked: function () {
					return true;
				}
			});
		};

		$scope.nuevoContacto = function (id) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Añadiendo contacto...'
			});
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=core_message_create_contacts&moodlewsrestformat=json&userids[0]=' + id).
				success(function (resultado) {
					$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=core_message_get_contacts&moodlewsrestformat=json').
						success(function (dataContactos) {
							$rootScope.contactos = dataContactos;
							$rootScope.contactosTotal = $rootScope.contactos.online.concat($rootScope.contactos.offline);
							hide();
						});
					$scope.closeModal();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un erro obteniendo los contactos, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		};

		$scope.eliminarContacto = function (id) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Eliminando contacto...'
			});
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=core_message_delete_contacts&moodlewsrestformat=json&userids[0]=' + id).
				success(function (resultado) {
					$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=core_message_get_contacts&moodlewsrestformat=json').
						success(function (dataContactos) {
							$rootScope.contactos = dataContactos;
							$rootScope.contactosTotal = $rootScope.contactos.online.concat($rootScope.contactos.offline);
						});
					$scope.closeModal();
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error eliminando el contacto, por favor inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		};

		$rootScope.$watch('token', function () {
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=core_message_get_contacts&moodlewsrestformat=json').
				success(function (dataContactos) {
					$rootScope.contactos = dataContactos;
					$rootScope.contactosTotal = $rootScope.contactos.online.concat($rootScope.contactos.offline);
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los contactos, por favor inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		});

		$scope.verMensajes = function (usertoid) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Obteniendo mensajes...'
			});
			$rootScope.mensajes = [];
			$rootScope.usertoid = usertoid;
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_core_message_get_messages&moodlewsrestformat=json&useridfrom=' + usertoid + '&useridto=' + $rootScope.usuario.userid + '&read=0').
				success(function (datoMensajesLeidos) {
					$rootScope.menLeidos = datoMensajesLeidos;
					$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_core_message_get_messages&moodlewsrestformat=json&useridfrom=' + usertoid + '&useridto=' + $rootScope.usuario.userid + '&read=1').
						success(function (datoMensajesNoLeidos) {
							$rootScope.mensajes = $rootScope.menLeidos.messages.concat(datoMensajesNoLeidos.messages);
						}).
						error(function (data, status, headers, config) {
							hide();
							var alertPopup = $ionicPopup.alert({
								title: 'Error al iniciar sesión',
								template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los mensajes no leídos, inténtelo más tarde.</p>',
								okText: 'Aceptar',
								okType: 'button-assertive'
							});
						});
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los mensajes leídos, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		}

		$interval(function () {
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_core_message_get_messages&moodlewsrestformat=json&useridfrom=' + $rootScope.usertoid + '&useridto=' + $rootScope.usuario.userid + '&read=0').
				success(function (datoMensajesLeidos) {
					$rootScope.menLeidos = datoMensajesLeidos;
					$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_core_message_get_messages&moodlewsrestformat=json&useridfrom=' + $rootScope.usertoid + '&useridto=' + $rootScope.usuario.userid + '&read=1').
						success(function (datoMensajesNoLeidos) {
							$rootScope.mensajes = $rootScope.menLeidos.messages.concat(datoMensajesNoLeidos.messages);
						}).
						error(function (data, status, headers, config) {
							hide();
							var alertPopup = $ionicPopup.alert({
								title: 'Error al iniciar sesión',
								template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los mensajes no leídos, inténtelo más tarde.</p>',
								okText: 'Aceptar',
								okType: 'button-assertive'
							});
						});
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los mensajes leídos, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});

		}, 1500);

		$scope.enviarMensaje = function () {
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=core_message_send_instant_messages&moodlewsrestformat=json&messages[0][touserid]=' + $rootScope.usertoid + '&messages[0][text]=' + $scope.mensajeDeEnvio + '&messages[0][textformat]=0&messages[0][textformat]=4').
				success(function (resultado) {
					if (resultado.msgid < 0) {
						$window.alert(resultado.errormessage);
					} else {
						$scope.verMensajes($rootScope.usertoid);
						$scope.mensajeDeEnvio = "";
					}

				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error enviando el mensaje, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});

		}

	})


	.controller('Calendario', function ($scope, $rootScope, $window, $http, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicLoading, $cordovaCalendar) {

		$scope.currentDate = new Date();
		$ionicSideMenuDelegate.canDragContent(true);

		$scope.htmlToPlaintext = function (text) {
			return String(text).replace(/<[^>]+>/gm, '');
		}



		$scope.toggleLeft = function () {
			$ionicSideMenuDelegate.toggleLeft();
		}

		var hide = function () {
			$ionicLoading.hide();
		};

		$scope.obtenerMes = function (mes) {
			var fecha = new Date(mes * 1000);
			return (String(fecha.getMonth() + 1));
		}

		var urlCursos = "";

		var grupoGeneral = { 'groupname': 'Grupo general', 'groupid': 0, 'courseid': $rootScope.data.id };
		var gruposPertenece = function (i) {
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_my_groups&moodlewsrestformat=json&courseid=' + $rootScope.data.id + '&userid=' + $rootScope.usuario.userid).
				success(function (grupos) {
					$rootScope.gruposCursos = grupos;
					$rootScope.gruposCursos.push(grupoGeneral);
					angular.forEach(grupos, function (curso) {
						urlCursos += '&events[groupids][' + i + ']=' + curso.groupid;
						i++;
					});
					urlCursos += '&events[groupids][' + i + ']=' + '0';
					$ionicLoading.show({
						template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Obteniendo eventos...'
					});
					var url = $rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=core_calendar_get_calendar_events&moodlewsrestformat=json&events[courseids][0]=' + $rootScope.data.id + urlCursos + '&options[timeend]=4000000000';
					$http.get(url).
						success(function (eventos) {
							$rootScope.eventos = eventos;
							urlCursos = "";
							i = 0;
							hide();
						}).
						error(function (data, status, headers, config) {
							hide();
							var alertPopup = $ionicPopup.alert({
								title: 'Error al iniciar sesión',
								template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los eventos del calendario, inténtelo más tarde.</p>',
								okText: 'Aceptar',
								okType: 'button-assertive'
							});
						});
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los grupos a los que pertenece, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		};

		$scope.mostrarEvento = function (inicio, duracion) {
			if ((inicio + duracion) > ($scope.currentDate / 1000)) {
				return true;
			} else {
				return false;
			}
		}

		$rootScope.$watch('data', function () {
			gruposPertenece(0);
		});

		$scope.evento = {};

		// Create the login modal that we will use later
		$ionicModal.fromTemplateUrl('templates/nuevo_evento.html', {
			scope: $scope
		}).then(function (modal) {
			$scope.modal = modal;
		});

		// Triggered in the login modal to close it
		$scope.cancelarEvento = function () {
			$scope.modal.hide();
		};

		// Open the login modal
		$scope.nuevoEvento = function () {
			$rootScope.esEvento = false;
			$scope.modal.show();
		};

		$scope.verEvento = function (evento) {
			$rootScope.esEvento = true;
			$rootScope.eventoMostrar = evento;
			$scope.modal.show();
		}


		// Perform the login action when the user submits the login form
		$scope.crearEvento = function () {
			var fechaInicio = new Date($scope.evento.inicio);
			var fechaFinal = new Date($scope.evento.fin);
			var fechaFinalInt = parseInt(fechaFinal.getTime());
			var fechaInicioInt = parseInt(fechaInicio.getTime());

			if (($scope.evento.titulo != null) && ($scope.evento.descripcion != null) && ($scope.evento.gr != null) && ($scope.evento.inicio != null) && ($scope.evento.fin != null) && (fechaFinalInt > fechaInicioInt)) {


				var duracion = parseInt((fechaFinalInt - fechaInicioInt) / 1000);
				$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_add_calendar_event&moodlewsrestformat=json&name=' + $scope.evento.titulo + '&description=' + $scope.evento.descripcion + '&courseid=' + $rootScope.data.id + '&groupid=' + $scope.evento.gr.groupid + '&eventtype=course&timestart=' + parseInt(fechaInicio.getTime() / 1000) + '&timeduration=' + duracion + '&visible=1').
					success(function (resultado) {
						gruposPertenece(0);

						var alertPopup = $ionicPopup.alert({
							title: 'Evento añadido al calendario',
							template: '<p style="text-align:center;">El evento "' + $scope.evento.titulo + '" se ha añadido correctamente al calendario.</p>',
							okText: 'Aceptar',
							okType: 'button-balanced'
						});
					}).
					error(function (data, status, headers, config) {
						hide();
						var alertPopup = $ionicPopup.alert({
							title: 'Error al iniciar sesión',
							template: '<p style="text-align:center;">Ha ocurrido un error creando el evento, inténtelo más tarde.</p>',
							okText: 'Aceptar',
							okType: 'button-assertive'
						});
					});
				$scope.cancelarEvento();
			} else {
				var alertPopup = $ionicPopup.alert({
					title: 'Error',
					template: '<p style="text-align:center;">Alguno de los parámetros no es correcto.</p>',
					okText: 'Aceptar',
					okType: 'button-assertive'
				});
			};
		};

		$scope.anadirCalendarioTelefono = function () {
			var fecha = $rootScope.eventoMostrar.timestart * 1000;
			var fecha_inicio = new Date(fecha);
			var fecha2 = $rootScope.eventoMostrar.timestart * 1000 + $rootScope.eventoMostrar.timeduration * 1000;
			var fecha_final = new Date(fecha2);
			var nombre = $scope.htmlToPlaintext($rootScope.eventoMostrar.name);
			var descripcion = $scope.htmlToPlaintext($rootScope.eventoMostrar.description);
			if ($rootScope.platform != "Android") {
				$cordovaCalendar.createCalendar({
					calendarName: 'Calendario Método',
					calendarColor: '#279dcc'
				}).then(function (result) {

					$cordovaCalendar.createEventInNamedCalendar({
						title: nombre,
						location: 'Rúa Aragón 82, Vigo',
						notes: descripcion,
						startDate: fecha_inicio,
						endDate: fecha_final,
						calendarName: 'Calendario Método'
					}).then(function (result) {
						var alertPopup = $ionicPopup.alert({
							title: 'Evento añadido al calendario',
							template: 'El evento se ha añadido a tu calendario \"Calendario Método\".',
							okText: 'Aceptar',
							okType: 'button-balanced'
						});
					}, function (err) {
						var alertPopup = $ionicPopup.alert({
							title: 'Error',
							template: 'Hubo un error añadiendo el evento al calendario \"Calendario Método\"',
							okText: 'Aceptar',
							okType: 'button-assertive'
						});
					});
				}, function (err) {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						template: 'Hubo un error creando el calendario \"Calendario Método\"',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
			} else {
				$cordovaCalendar.createEventInteractively({
					title: nombre,
					location: 'Rúa Aragón 82, Vigo',
					notes: descripcion,
					startDate: fecha_inicio,
					endDate: fecha_final
				}).then(function (result) {
				}, function (err) {
					var alertPopup = $ionicPopup.alert({
						title: 'Error',
						template: 'Hubo un error añadiendo el evento al calendario',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
			};
		};


	})

	.controller('Archivos', function ($scope, $rootScope, $ionicSideMenuDelegate, $http, $window, $ionicModal, $ionicActionSheet, $state, $sce, $ionicLoading, $ionicPopup) {

		$scope.toggleLeft = function () {
			$ionicSideMenuDelegate.toggleLeft();
		}

		var hide = function () {
			$ionicLoading.hide();
		};

		$scope.showImages = function (src) {
			$scope.imagen = $sce.trustAsResourceUrl(src);
			$scope.showModal('templates/ver_recurso.html');
		}

		$scope.showModal = function (templateUrl) {
			$ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}

		$scope.getClass = function (urlRecurso) {

			if (angular.lowercase(urlRecurso).indexOf(".pdf") > 0) {
				return ("md md-attach-file rosa");
			} else if ((angular.lowercase(urlRecurso).indexOf(".mov") > 0) || (angular.lowercase(urlRecurso).indexOf(".mp4") > 0) || (angular.lowercase(urlRecurso).indexOf(".avi") > 0)) {
				return ("md md-videocam rosa");
			} else if ((angular.lowercase(urlRecurso).indexOf(".jpg") > 0) || (angular.lowercase(urlRecurso).indexOf(".png") > 0)) {
				return ("md md-photo rosa");
			} else {
				return ("md md-folder-open rosa");
			}
		};

		// Close the modal
		$scope.closeModal = function () {
			$scope.modal.hide();
			$scope.modal.remove()
		};

		$scope.esVideo = false;

		$scope.showActionsheet = function (urlRecurso) {

			if (angular.lowercase(urlRecurso).indexOf(".pdf") > 0) {
				var botones = [{ text: 'Descargar' }];
			} else {
				var botones = [{ text: 'Descargar' }, { text: 'Ver' }];
			};

			if ((angular.lowercase(urlRecurso).indexOf(".mov") > 0) || (angular.lowercase(urlRecurso).indexOf(".mp4") > 0) || (angular.lowercase(urlRecurso).indexOf(".avi") > 0)) {
				$scope.esVideo = true;
			} else {
				$scope.esVideo = false;
			};

			$ionicActionSheet.show({
				//titleText: 'Opciones',
				buttons: botones,
				cancelText: 'Cancelar',
				cancel: function () { },
				buttonClicked: function (index) {
					if (index == 1) {
						$scope.showImages(urlRecurso);
					} else if (index == 0) {
						var ref = window.open(urlRecurso, "_system", "location=yes,closebuttoncaption=Close,enableViewportScale=yes, hidden=yes");
					}
					return true;
				},
				destructiveButtonClicked: function () {
					return true;
				}
			});

		};

		$scope.exturl = function (urlRecurso) {
			var url = urlRecurso;
			if (url.indexOf(".pdf") > 0) {
				var ref = window.open(urlRecurso, "_system", "location=yes,closebuttoncaption=Close,enableViewportScale=yes, hidden=yes");
			} else {
				$scope.showImages(url);
			};
		};

		$scope.uploadFile = function (files) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Subiendo...'
			});
			var fd = new FormData();
			fd.append('wstoken', $rootScope.token);
			fd.append('moodlewsrestformat', 'json');
			fd.append('wsfunction', 'local_mobile_upload_file');
			fd.append('path', '/');
			fd.append('userfile', files[0]);

			$http.post($rootScope.url + '/webservice/rest/server.php', fd, {
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined }
			})
				.success(function (resul) {
					if (resul == "Ok") {
						$scope.obtenerArchivosPrivados();
						var alertPopup = $ionicPopup.alert({
							title: 'Archivos',
							template: 'El archivo se ha subido con éxito',
							okText: 'Aceptar',
							okType: 'button-balanced'
						});
					} else {
						var alertPopup = $ionicPopup.alert({
							title: 'Archivos',
							template: 'Hubo un error en la subida del archivo, por favor vuelva a intentarlo.',
							okText: 'Aceptar',
							okType: 'button-assertive'
						});
					}
					hide()
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error subiendo el archivo, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});

		}

		$scope.obtenerArchivos = function (nivel) {
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_core_files_get_files&moodlewsrestformat=json&contextid=' + nivel + '&component=&filearea=&itemid=0&filepath=&filename=').
				success(function (archivos) {
					$rootScope.archivo = archivos;
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los archivos, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		};

		$scope.obtenerArchivosPrivados = function () {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Obteniendo ficheros...'
			});
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_core_files_get_files&moodlewsrestformat=json&contextid=' + $rootScope.contextoUsuario + '&component=user&filearea=private&itemid=0&filepath=&filename=').
				success(function (privados) {
					$rootScope.privado = privados;
					var i = 0;
					angular.forEach(privados.files, function (usuario) {
						var url = $rootScope.usuario.siteurl + "/webservice" + (usuario.url).substr($rootScope.usuario.siteurl.length) + "?token=" + $rootScope.token;
						$rootScope.privado.files[i].url = url;
						i++;
					});
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los archivos privados, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		};




		$rootScope.$watch('contextoUsuario', function () {
			$scope.obtenerArchivos(1);
			$scope.obtenerArchivosPrivados();
		});

	})

	.controller('Foros', function ($scope, $rootScope, $window, $http, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $sce, $ionicLoading) {

		$scope.toggleLeft = function () {
			$ionicSideMenuDelegate.toggleLeft();
		}

		var hide = function () {
			$ionicLoading.hide();
		};

		$scope.htmlToPlaintext = function (text) {
			return String(text).replace(/<[^>]+>/gm, '');
		}

		$scope.mensajeOriginal = function (text) {
			var posicion = String(text).indexOf("(Editado");
			if (posicion > 0) {
				return String(text).substring(0, posicion);
			} else {
				return text;
			};
		}

		$scope.mensajeEditado = function (text) {
			var posicion = String(text).indexOf("(Editado");
			if (posicion > 0) {
				return String(text).substring(posicion);
			} else {
				return "";
			}
		}

		$scope.abrirAdjunto = function (url) {
			var ref = window.open(url + "?token=" + $rootScope.token, "_system", "location=yes, closebuttoncaption=Close, enableViewportScale=yes, hidden=yes");
		}

		$scope.showImages = function (id) {
			$scope.tituloPost = id;
			$scope.showModal('templates/responderPost.html');

		}

		$scope.showModal = function (templateUrl) {
			$ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		}

		// Close the modal
		$scope.closeModal = function () {
			$scope.modal.hide();
			$scope.modal.remove()
		};
		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

		$scope.crearPost = function (evento) {
			var datos = "wstoken=" + $rootScope.token + "&wsfunction=local_mobile_new_forum_post&action=reply&discussion=" + $rootScope.discussionId + "&parent=" + $scope.tituloPost + "&userid=" + $rootScope.usuario.userid + "&subject=Re: " + $scope.subject + "&message=" + evento.texto + "&forum=" + $rootScope.idForo + "&course=0";
			$http.post($rootScope.url + "/webservice/rest/server.php", datos).
				success(function (respuesta) {
					$scope.closeModal();
					$scope.verPost($rootScope.discussionId, $rootScope.discussionNombre);
					$scope.hijoVisible = false;
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Respuesta',
						template: 'La respuesta se ha creado con éxito',
						okText: 'Aceptar',
						okType: 'button-balanced'
					});

				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error creando el post, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		}


		$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_mod_forum_get_forums_by_courses&moodlewsrestformat=json&courseids[0]=' + $rootScope.data.id).
			success(function (foros) {
				$rootScope.forosDelCurso = foros;
			}).
			error(function (data, status, headers, config) {
				hide();
				var alertPopup = $ionicPopup.alert({
					title: 'Error al iniciar sesión',
					template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los foros, inténtelo más tarde.</p>',
					okText: 'Aceptar',
					okType: 'button-assertive'
				});
			});

		$scope.verMensajes = function (id, nombre) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Cargando...'
			});
			$rootScope.nombre = nombre;
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_mod_forum_get_forum_discussions_paginated&moodlewsrestformat=json&forumid=' + id).
				success(function (entradasForo) {
					$rootScope.idForo = id;
					$rootScope.entradasForo = entradasForo;
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los mensajes del foro, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		}

		$scope.verPost = function (id, nombre) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Cargando...'
			});
			$rootScope.discussionNombre = nombre;
			$rootScope.discussionId = id;
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_mod_forum_get_forum_discussion_posts&moodlewsrestformat=json&discussionid=' + id).
				success(function (discussionForo) {
					$rootScope.discussionForo = discussionForo;
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo los post de la entrada, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		}

		$scope.post = {};
		var obtenerPost = function (id) {
			$scope.post = {}
			angular.forEach($rootScope.discussionForo.posts, function (post) {
				if (post.id == id) {
					$scope.post = post;
				}
			});
		};

		$scope.verImagenUsusario = function (enlace) {
			var link = enlace + '?token=' + $rootScope.token;
			return link;
		}

		$scope.responderPost = function (id) {
			$window.alert(id);
		}

		$scope.hijoVisible = false;
		$scope.cadenaRespuestas = [];

		$scope.numeroDeHijos = function () {
			if ($scope.post.children.length > 0) {
				return true;
			} else {
				return false;
			}
		}

		$scope.verHijos = function (hijos) {

			var cadenaHijos = '';
			angular.forEach(hijos, function (hijito) {
				obtenerPost(hijito);
				var link = $scope.verImagenUsusario($scope.post.userpictureurl);
				cadenaHijos = cadenaHijos +
				'<div style="width: 100%; border-top: 1px dotted #55b2d7;margin-bottom:1px;"></div><span style="margin-left: 3%;  background-color: white; width: 100%;"><img src=' + link + ' style="border-radius: 50%; width: 3em; position:relative; top:10px;"/>' +
				'<span class="familia_light" style="margin-left:10px; padding-top: 2%; display:inline-block; width: 100% background-color: white;">' +
				'<span class="familia_light" style="font-size: 20px; color: #A8A8A8; line-height: 20px;">' + $scope.post.userfullname + '</span><br>' +
				'<span class="familia_light" style="font-size: 15px; color: #88C9E2; line-height: 20px;">{{' + $scope.post.modified + ' * 1000 | date:"HH:mm (dd/MM/yy)"}}</span>' +
				'</span>' +
				'</span>' +
				'<span style="border-width: 0px; width: 100%; background-color: transparent; margin-top: 7%;" class="item item-text-wrap">' +
				'<span class="familia_light" style="font-size: 1.0em; color: #585850;">' + $scope.mensajeOriginal($scope.htmlToPlaintext($scope.post.message)) + '</span><br>' +
				'<span class="familia_light" style="font-size: 0.8em; color: #88C9E2;">' + $scope.mensajeEditado($scope.htmlToPlaintext($scope.post.message)) + '</span>' +
				'</span>' +
				'<div style="font-size: 1.0em; text-align:right; color:#F3565D;font-family: Roboto_light; background-color: white; width:95%; padding-bottom: 2%;" ng-if=' + $scope.post.canreply + ' ng-click="showImages(' + $scope.post.id + ')">Responder</div>' +
				'<div style="background-color: #EAF5FA;" ng-if="' + $scope.numeroDeHijos() + '"><div style="position:relative; left: 5%; top: 0px; width: 95%; background-color:white;" compile-Html="verHijos([' + $scope.post.children.toString() + '])"></div></div>';
			});
			return $sce.trustAsHtml(cadenaHijos);
		}


		$scope.verPostRaiz = function (post) {
			if (post.parent == $scope.idPadre) {
				return true;
			} else {
				return false;
			};
		}

		$scope.esPadre = function (post) {
			if (post.parent == 0) {
				$scope.idPadre = post.id
				return true;
			} else {
				return false;
			};
		}

		$scope.esElPost = function (post) {
			if (post.id == $scope.tituloPost) {
				$scope.subject = $scope.htmlToPlaintext(post.message);
				return true;
			} else {
				return false;
			};
		}

	})

	.controller('Notas', function ($scope, $rootScope, $window, $http, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $ionicLoading) {

		$scope.toggleLeft = function () {
			$ionicSideMenuDelegate.toggleLeft();
		}

		var hide = function () {
			$ionicLoading.hide();
		};

		$scope.cargarCalificaciones = function (usuarioid) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Cargando...'
			});
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_core_grades_get_grades&moodlewsrestformat=json&courseid=' + $rootScope.data.id + '&userids[0]=' + usuarioid).
				success(function (calificaciones) {
					$rootScope.notas = calificaciones;
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error obteniendo las calificaciones, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});

		}

		var verCalificaciones = function () {
			if (!$rootScope.UsuarioAutorizado) {
				$scope.cargarCalificaciones($rootScope.usuario.userid);
			}
		}

		verCalificaciones();

		$rootScope.$watch('data', function () {
			$rootScope.notas = {};
			verCalificaciones();
		})

		$scope.cargarCalificacionesProfesor = function (usuarioid) {
			$ionicLoading.show({
				template: '<i class="icon ion-loading-c" style="font-size:64px;"></i></br>Cargando...'
			});
			$http.get($rootScope.url + '/webservice/rest/server.php?wstoken=' + $rootScope.token + '&wsfunction=local_mobile_core_grades_get_grades&moodlewsrestformat=json&courseid=' + $rootScope.data.id + '&userids[0]=' + usuarioid).
				success(function (calificacionesProfesor) {
					$rootScope.notasProfesor = calificacionesProfesor;
					hide();
				}).
				error(function (data, status, headers, config) {
					hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Error al iniciar sesión',
						template: '<p style="text-align:center;">Ha ocurrido un error cargando las calificaciones de los alumnos, inténtelo más tarde.</p>',
						okText: 'Aceptar',
						okType: 'button-assertive'
					});
				});
		}
	})

	.controller('Certificados', function ($scope, $rootScope, $ionicSideMenuDelegate, $sce, $window, $http, $ionicScrollDelegate, $interval, $ionicActionSheet, $ionicModal, $ionicLoading) {
		$scope.toggleLeft = function () {
			$ionicSideMenuDelegate.toggleLeft();
		}
	})


