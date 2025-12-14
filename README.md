# Meet&Go - Plataforma de Viajes Colaborativos

Meet&Go es una aplicación web desarrollada con Angular 19 que permite a los usuarios crear, descubrir y participar en viajes colaborativos. La plataforma facilita la organización de viajes compartidos, la gestión de participantes y la comunicación entre los miembros de cada viaje.

## 🏗️ Arquitectura

### Stack Tecnológico

- **Framework**: Angular 19.1.8 (Standalone Components)
- **Lenguaje**: TypeScript 5.7
- **Estilos**: CSS3 + Bootstrap 5
- **Gestión de Estado**: RxJS + Services
- **Formularios**: Reactive Forms
- **HTTP Client**: Angular HttpClient
- **Enrutamiento**: Angular Router con Guards
- **Iconos**: Bootstrap Icons

### Estructura del Proyecto

```
app-viajes-front/
├── src/
│   ├── app/
│   │   ├── config/              # Configuraciones de la app
│   │   ├── guards/              # Guards de autenticación
│   │   ├── interfaces/          # Interfaces TypeScript
│   │   ├── pages/               # Componentes de páginas
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   ├── trip/            # Módulo de viajes
│   │   │   ├── user/            # Módulo de usuarios
│   │   │   └── requests/        # Gestión de solicitudes
│   │   ├── services/            # Servicios de la aplicación
│   │   │   ├── api-rest/        # Servicios REST API
│   │   │   ├── auth.service.ts  # Autenticación JWT
│   │   │   ├── trip.service.ts  # Estado de viajes
│   │   │   └── user.service.ts  # Estado de usuarios
│   │   └── shared/              # Componentes y utilidades compartidas
│   │       ├── components/      # Componentes reutilizables
│   │       ├── constants/       # Constantes de la app
│   │       └── utils/           # Funciones de utilidad
│   └── styles.css               # Estilos globales
```

### Patrón de Arquitectura

La aplicación sigue un patrón de arquitectura **por capas** con separación de responsabilidades:

1. **Capa de Presentación** (`pages/` y `shared/components/`): Componentes standalone de Angular que manejan la UI/UX
2. **Capa de Servicios** (`services/`): Lógica de negocio y gestión de estado
3. **Capa de API** (`services/api-rest/`): Comunicación con el backend REST
4. **Capa de Utilidades** (`shared/utils/`): Funciones auxiliares y helpers

### Gestión de Estado

- **Servicios de Estado**: `TripStateService`, `UserStateService`, `MessageStateService`
- **Servicios de Autenticación**: `AuthService` con JWT y localStorage para persistencia
- **RxJS BehaviorSubject**: Para reactivity en el estado de autenticación

## 🚀 Funcionalidades Principales

### 1. Autenticación y Gestión de Usuarios

**Archivos principales:**
- `services/auth.service.ts`
- `services/api-rest/auth-rest.service.ts`
- `services/api-rest/user-rest.service.ts`
- `pages/login/`
- `pages/user/`

**Características:**
- ✅ Registro de nuevos usuarios con validación de formularios
- ✅ Login con email y contraseña
- ✅ Autenticación JWT con decodificación manual (sin librerías externas)
- ✅ Persistencia de sesión en `localStorage`
- ✅ Guards de navegación para rutas protegidas
- ✅ Perfil de usuario con foto, biografía e intereses
- ✅ Edición de perfil y cambio de contraseña
- ✅ Modal de perfil de usuario en viajes y solicitudes

**Implementación técnica:**
- Decodificación de JWT en `AuthService.decodeJWT()`
- Extracción automática de `userId` del token
- Restauración de sesión al inicializar la app
- Observable `authStatus$` para reactividad en el estado de autenticación

### 2. Gestión de Viajes

**Archivos principales:**
- `services/api-rest/trip-rest.service.ts`
- `services/trip.service.ts`
- `pages/trip/trip-list/`
- `pages/trip/trip-form/`
- `pages/trip/trip-detail/`

**Características:**
- ✅ Creación de viajes con información completa:
  - Título, descripción, salida y destino
  - Fechas de inicio y fin
  - Coste por persona
  - Mín/máx participantes con validación cruzada
  - Información de transporte, alojamiento e itinerario
  - URL de imagen personalizada
- ✅ Listado de viajes con tres categorías:
  - **Mis viajes** (viajes creados por el usuario)
  - **Mis solicitudes** (viajes donde el usuario ha solicitado participar)
  - **Todos los viajes** (catálogo público)
- ✅ Filtrado y búsqueda de viajes por:
  - Destino
  - Salida (departure)
  - Fecha
  - Organizador
- ✅ Detalle de viaje con:
  - Información completa del viaje
  - Perfil del organizador
  - Lista de participantes aceptados
  - Botón de solicitud de participación
  - Acceso al chat interno (solo participantes aceptados)
  - Edición (solo organizador)
- ✅ Estados de viaje: `open`, `closed`, `completed`
- ✅ Tarjetas de viaje (`TripCardComponent`) con tipos:
  - `owner`: Viajes creados (con botón de editar)
  - `accepted`: Participación aceptada (acceso al chat)
  - `pending`: Solicitud pendiente
  - `rejected`: Solicitud rechazada
  - `discover`: Viajes del catálogo público

**Implementación técnica:**
- FormGroup reactivo con validadores custom
- Validación cruzada: `max_participants > min_participants`
- Servicio de estado `TripStateService` para gestión de formularios
- Endpoints REST para CRUD completo de viajes

### 3. Sistema de Solicitudes y Participaciones

**Archivos principales:**
- `services/api-rest/participation-rest.service.ts`
- `pages/requests/`

**Características:**
- ✅ Envío de solicitudes de participación con mensaje personalizado
- ✅ Vista de solicitudes enviadas con estados:
  - `pending`: Pendiente de aprobación
  - `accepted`: Aceptada por el organizador
  - `rejected`: Rechazada
  - `left`: Usuario abandonó el viaje
- ✅ Vista de solicitudes recibidas (viajes creados por el usuario):
  - Lista de participantes con foto y nombre
  - Botones de aceptar/rechazar solicitudes
  - Ver perfil de los solicitantes
- ✅ Vista de participantes aceptados en cada viaje
- ✅ Contador de participantes aceptados vs máximo

**Implementación técnica:**
- Filtrado de participaciones por estado con `HttpParams`
- Endpoints específicos:
  - `GET /api/participants/my-requests`: Solicitudes enviadas
  - `GET /api/participants/my-creator-requests`: Solicitudes recibidas
  - `POST /api/participants/:trip_id`: Crear solicitud
  - `PATCH /api/participants/:participation_id`: Cambiar estado

### 4. Chat Interno de Viajes

**Archivos principales:**
- `pages/trip/trip-chat/`
- `services/api-rest/chat-rest.service.ts`
- `services/message.service.ts`

**Características:**
- ✅ Chat en tiempo real para participantes aceptados y organizador
- ✅ Sistema de mensajes jerárquico ilimitado:
  - Mensajes principales
  - Respuestas a mensajes (cualquier nivel de anidación)
  - Vista en árbol con indentación visual
- ✅ Funcionalidades de mensajes:
  - Enviar mensajes nuevos
  - Responder a mensajes existentes
  - Eliminar mensajes propios (sin respuestas)
  - Vista previa de mensajes largos
  - Contador de caracteres (máx 500)
- ✅ Interfaz responsive:
  - Desktop: Grid con mensajes a la izquierda, formulario a la derecha
  - Mobile: Mensajes arriba, formulario abajo
- ✅ Scroll automático al final al cargar o enviar mensajes
- ✅ Timestamps con formato UTC

**Implementación técnica:**
- Organización de mensajes con algoritmo recursivo en `ChatApiService.getMessagesByTrip()`
- Estructura de datos en árbol: `IMessage` con array `replies`
- Componente modular: `MessageListComponent` separado de formulario
- Servicio de estado `MessageStateService` para formulario reactivo
- Búsqueda recursiva de mensajes en el árbol con `findMessageById()`

### 5. Sistema de Encuestas (Viajes)

**Archivos principales:**
- `services/api-rest/survey-rest.service.ts`
- `services/survey.service.ts`
- `shared/components/survey-modal/`
- `shared/components/survey/`

**Características:**
- ✅ Creación de encuestas por el organizador:
  - Título y descripción
  - Múltiples opciones (mínimo 2)
  - Modal de creación con validación
- ✅ Votación de participantes:
  - Una opción por encuesta
  - Cambio de voto permitido
  - Resultados en tiempo real con porcentajes
- ✅ Integración en el chat:
  - Aparecen entre los mensajes ordenados por fecha
  - Diseño distintivo con icono de gráfico
  - Vista compacta y expandible

**Implementación técnica:**
- Interface `ISurvey` con array de opciones (`ISurveyOption`)
- Cálculo de porcentajes en cliente
- Actualización reactiva tras cada voto
- Modal reutilizable `SurveyModalComponent`

### 6. Componentes Compartidos

**Archivos principales:**
- `shared/components/navbar/`
- `shared/components/modal-alert/`
- `shared/components/spinner/`
- `shared/components/trip-card/`
- `shared/components/user-profile-modal/`

**Características:**
- ✅ **Navbar**: Navegación responsive con logo Meet&Go, menú hamburguesa en mobile
- ✅ **Modal Alert**: Modal reutilizable para confirmaciones, errores y éxitos
- ✅ **Spinner**: Indicador de carga global
- ✅ **Trip Card**: Componente de tarjeta de viaje con múltiples tipos
- ✅ **User Profile Modal**: Modal de perfil de usuario con foto, bio e intereses

### 7. Utilidades y Constantes

**Archivos principales:**
- `shared/utils/http-error.utils.ts`
- `shared/utils/data.utils.ts`
- `shared/utils/route.utils.ts`
- `shared/constants/field-lengths.constants.ts`
- `shared/constants/validation-messages.constants.ts`

**Características:**
- ✅ Manejo centralizado de errores HTTP
- ✅ Utilidades de manipulación de datos
- ✅ Helpers de navegación y rutas
- ✅ Constantes de longitud de campos para validaciones
- ✅ Mensajes de validación estandarizados

## 🔐 Seguridad

- JWT token almacenado en `localStorage`
- Guards de autenticación en rutas protegidas (`authGuard`)
- Headers de autorización en todas las peticiones API protegidas
- Validación de permisos en componentes (organizador vs participante)

## 📱 Responsive Design

- Mobile-first approach con media queries
- Breakpoints principales:
  - Mobile: hasta 576px
  - Tablet: 768px - 991.98px
  - Desktop: 992px+
- Navbar con menú hamburguesa en mobile
- Chat con layout vertical en mobile
- Tarjetas de viaje adaptables

## 🎨 UX/UI

- Diseño moderno con Bootstrap 5
- Iconos de Bootstrap Icons
- Paleta de colores:
  - Principal: `#17a2b8` (turquesa)
  - Secundario: `#a5d6a7` (verde claro)
  - Estados: verde (aceptado), amarillo (pendiente), rojo (rechazado)
- Transiciones suaves y efectos hover
- Feedback visual en todas las acciones
- Modales para confirmaciones críticas

## 🌐 Despliegue

### Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
