/** Política editable. Mantener pendiente de revisión jurídica antes de su aprobación. */
export const POLITICA_DATOS = {
  nombre: 'SERENITY',
  titulo: 'POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES',
  subtitulo: 'Privacidad, confidencialidad y protección de la información',
  version: '1.0',
  actualizacion: '7 de noviembre de 2026',
  ambito: 'República de Colombia',
  secciones: [
    { id: 'objetivo', titulo: '1. Objetivo', parrafos: [
      'La presente política establece las condiciones para la recolección, almacenamiento, utilización, conservación y eliminación de los datos personales tratados mediante la aplicación Serenity.',
      'Su finalidad es garantizar el respeto a la privacidad, la confidencialidad y los derechos de los titulares, conforme a la Ley 1581 de 2012, el Decreto 1074 de 2015 y demás disposiciones colombianas aplicables.'
    ] },
    { id: 'datos-tratados', titulo: '2. Datos personales tratados', parrafos: [
      'Serenity utiliza un modelo de registro basado en la minimización de información personal.'
    ], subsecciones: [
      { titulo: '2.1. Datos de registro', lista: ['Correo electrónico.', 'Nombre de usuario elegido libremente por el titular.', 'Información técnica de autenticación necesaria para administrar la cuenta.'] },
      { titulo: '2.2. Información de bienestar emocional', lista: ['Registros del estado de ánimo.', 'Historial de actividades realizadas.', 'Progreso y estadísticas personales.', 'Información de seguimiento de hábitos y continuidad de uso.', 'Otros registros emocionales que el usuario decida introducir mediante las funcionalidades disponibles.'] },
      { titulo: '2.3. Registros técnicos', parrafos: [
        'La aplicación genera registros técnicos de funcionamiento y errores necesarios para las tareas de mantenimiento, diagnóstico y seguridad.',
        'Estos registros podrán contener datos personales cuando permitan identificar directa o indirectamente a un usuario.',
        'Serenity no utiliza herramientas de analítica comercial o publicitaria según la configuración declarada para esta versión.'
      ] }
    ] },
    { id: 'finalidades', titulo: '3. Finalidades del tratamiento', parrafos: ['Los datos personales serán tratados para las siguientes finalidades:'], lista: [
      'Crear, identificar y administrar cuentas de usuario.', 'Permitir la autenticación y el acceso seguro.', 'Guardar los registros emocionales que el usuario decida proporcionar.', 'Mostrar el historial de actividades y el progreso individual.', 'Mantener las funcionalidades de seguimiento de hábitos y motivación.', 'Diagnosticar errores técnicos y mantener la seguridad de la plataforma.', 'Atender solicitudes relacionadas con las cuentas y los derechos de los titulares.', 'Cumplir las obligaciones legales aplicables.'
    ], cierre: 'Cualquier finalidad adicional deberá informarse previamente y contar con la autorización correspondiente cuando sea exigible.' },
    { id: 'datos-sensibles', titulo: '4. Tratamiento de datos sensibles', parrafos: [
      'Los registros emocionales pueden contener información relacionada con la salud mental o permitir inferir aspectos de ella.',
      'Por esta razón, cuando corresponda, serán considerados datos sensibles conforme al artículo 5 de la Ley 1581 de 2012.',
      'El tratamiento de estos datos se realizará únicamente bajo las condiciones permitidas por la legislación colombiana.',
      'Cuando sea legalmente exigible, se solicitará autorización explícita, previa e informada. El titular será informado sobre:'
    ], lista: ['Los datos sensibles que serán tratados.', 'Las finalidades específicas del tratamiento.', 'El carácter facultativo de suministrar datos sensibles.', 'Los derechos que le asisten como titular.'], cierre: 'La autorización deberá conservarse como evidencia del consentimiento otorgado.' },
    { id: 'seguridad', titulo: '5. Almacenamiento y seguridad de la información', parrafos: [
      'Los datos de las cuentas, los registros emocionales y el progreso se almacenan mediante el backend de Serenity en una base de datos PostgreSQL.',
      'Se deberán implementar medidas técnicas, humanas y administrativas apropiadas para proteger la información, entre ellas:'
    ], lista: ['Control de acceso a la información.', 'Protección de las credenciales de autenticación.', 'Restricción de consultas y modificaciones no autorizadas.', 'Protección de las comunicaciones entre los componentes de la aplicación.', 'Protección de las bases de datos y copias de respaldo, cuando existan.', 'Control de acceso a los registros técnicos.', 'Procedimientos para gestionar incidentes de seguridad.'], cierre: 'Las medidas de seguridad deberán corresponder a las funcionalidades realmente implementadas en la plataforma.' },
    { id: 'identidad', titulo: '6. Identidad y privacidad de los usuarios', parrafos: [
      'Serenity no exige que las personas utilicen su nombre real como nombre de usuario.',
      'Cada usuario puede elegir libremente un identificador para su cuenta.',
      'Sin embargo, las cuentas se encuentran vinculadas a una dirección de correo electrónico y pueden incluir información emocional asociada.',
      'Por ello, Serenity no garantiza anonimato absoluto. La información vinculada a una cuenta será considerada dato personal cuando permita identificar directa o indirectamente a su titular.'
    ] },
    { id: 'derechos', titulo: '7. Derechos de los titulares', parrafos: ['De conformidad con el artículo 8 de la Ley 1581 de 2012, los titulares podrán:'], lista: [
      'Conocer, actualizar y rectificar sus datos personales.', 'Solicitar prueba de la autorización otorgada, salvo las excepciones legales.', 'Ser informados sobre el uso dado a sus datos.', 'Presentar quejas ante la Superintendencia de Industria y Comercio, previo cumplimiento de los requisitos legales.', 'Revocar la autorización o solicitar la supresión de datos cuando proceda legalmente.', 'Acceder gratuitamente a sus datos personales conforme a la ley.'
    ] },
    { id: 'consultas', titulo: '8. Consultas y reclamaciones', parrafos: [
      'Los titulares podrán presentar solicitudes relacionadas con sus datos personales a través de los canales oficiales de atención habilitados por Serenity.',
      'Las consultas deberán atenderse dentro del término máximo de diez (10) días hábiles contados desde su recepción, con la posibilidad de prórroga legal de hasta cinco (5) días hábiles adicionales, previa información al solicitante.',
      'Los reclamos deberán resolverse dentro de quince (15) días hábiles contados a partir del día siguiente a su recepción completa, con posibilidad de prórroga legal de hasta ocho (8) días hábiles adicionales, previa información al titular.',
      'Los procedimientos se sujetarán a los artículos 14 y 15 de la Ley 1581 de 2012.'
    ] },
    { id: 'conservacion', titulo: '9. Conservación y eliminación de datos', parrafos: [
      'Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades informadas y las obligaciones legales aplicables.',
      'Se deberán establecer criterios de conservación para:'
    ], lista: ['Datos de registro y autenticación.', 'Registros emocionales.', 'Historial de actividades y progreso.', 'Registros técnicos.', 'Copias de respaldo, cuando existan.'], cierre: 'Cuando proceda una solicitud de supresión, se adoptarán las medidas correspondientes, teniendo en cuenta las obligaciones legales de conservación. La eliminación de una cuenta no implica necesariamente la eliminación inmediata de información que deba conservarse por disposición legal.' },
    { id: 'menores', titulo: '10. Tratamiento de datos de niños, niñas y adolescentes', parrafos: [
      'Serenity está diseñada para el público general y puede ser utilizada por niños, niñas y adolescentes.',
      'El tratamiento de sus datos deberá cumplir con el artículo 7 de la Ley 1581 de 2012, el Decreto 1074 de 2015 y la Ley 1098 de 2006.',
      'Se garantizará:'
    ], lista: ['El respeto al interés superior del menor.', 'La protección de sus derechos fundamentales.', 'La valoración de su opinión conforme a su madurez.', 'La autorización de su representante legal cuando corresponda.', 'Medidas adecuadas de confidencialidad y seguridad.'], cierre: 'El tratamiento de datos sensibles de menores deberá cumplir las condiciones legales especiales aplicables.' },
    { id: 'terceros', titulo: '11. Acceso por terceros y proveedores tecnológicos', parrafos: [
      'El acceso a los datos personales estará limitado a las personas y proveedores que deban intervenir legítimamente en la operación, mantenimiento o seguridad de Serenity.',
      'Si se utilizan servicios externos de alojamiento, autenticación, correo electrónico, almacenamiento o infraestructura, deberán identificarse los tratamientos correspondientes y establecerse las garantías contractuales y legales necesarias.',
      'Cuando exista transmisión o transferencia internacional de datos personales, se aplicarán las disposiciones pertinentes de la legislación colombiana.',
      'La utilización de PostgreSQL no implica por sí sola que exista una transferencia de información a terceros.'
    ] },
    { id: 'incidentes', titulo: '12. Incidentes de seguridad', parrafos: [
      'Se deberán establecer procedimientos para identificar, gestionar y documentar incidentes que puedan comprometer la seguridad de los datos personales.',
      'Cuando corresponda legalmente, se realizarán las comunicaciones y reportes exigidos por las autoridades competentes.'
    ] },
    { id: 'modificaciones', titulo: '13. Modificaciones de la política', parrafos: [
      'La presente política podrá actualizarse para reflejar cambios normativos, técnicos u operativos.',
      'Las modificaciones sustanciales deberán informarse oportunamente a los titulares y, cuando sea necesario, deberán obtenerse nuevas autorizaciones.'
    ] },
    { id: 'vigencia', titulo: '14. Vigencia', parrafos: [
      'La presente política entrará en vigor a partir de su publicación y permanecerá vigente mientras Serenity realice actividades de tratamiento de datos personales, sin perjuicio de las actualizaciones que correspondan.'
    ] }
  ]
};
