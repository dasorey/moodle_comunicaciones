// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.Directives'])

.run(function($ionicPlatform) {

  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    //if (window.StatusBar) {
      // org.apache.cordova.statusbar required
	 //StatusBar.hide();

    //}
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.mensajes', {
    url: "/mensajes",
    views: {
      'menuContent': {
        templateUrl: "templates/mensajes.html",
        controller: 'Mensajes'
      }
    }
  })

  .state('app.conversacion', {
    url: "/conversacion",
    views: {
      'menuContent': {
        templateUrl: "templates/conversacion.html",
        controller: 'Mensajes'
      }
    }
  })


  .state('app.post', {
    url: "/post",
    views: {
      'menuContent': {
        templateUrl: "templates/post.html",
        controller: 'Foros'
      }
    }
  })

  .state('app.discussion', {
    url: "/discussion",
    views: {
      'menuContent': {
        templateUrl: "templates/discussion.html",
        controller: 'Foros'
      }
    }
  })

  .state('app.foros', {
    url: "/foros",
    views: {
      'menuContent': {
        templateUrl: "templates/foros.html",
        controller: 'Foros'
      }
    }
  })

  .state('app.cursos', {
    url: "/cursos",
    views: {
      'menuContent': {
        templateUrl: "templates/cursos.html"
      }
    }
  })

  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html"
      }
    }
  })

  .state('app.playlists', {
    url: "/playlists",
    views: {
      'menuContent': {
        templateUrl: "templates/playlists.html",
        controller: 'LoginInicio'
      }
    }
  })

  .state('app.servidor', {
    url: "/servidor",
    views: {
      'menuContent': {
        templateUrl: "templates/servidor.html",
        controller: 'LoginInicio'
      }
    }
  })


  .state('app.single', {
    url: "/curso_detalle",
    views: {
      'menuContent': {
        templateUrl: "templates/curso_detalle.html",
        controller: 'CursoDetalle'
      }
    }
  })

  .state('app.curso_lec', {
    url: "/curso_lec",
    views: {
      'menuContent': {
        templateUrl: "templates/curso_lec.html",
        controller: 'CursoDetalle'
      }
    }
  })

  .state('app.leccion', {
    url: "/leccion",
    views: {
      'menuContent': {
        templateUrl: "templates/leccion.html",
		controller: 'Leccion'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/servidor');
});
