# Laboratorio de Amazon S3 - Almacenamiento de imágenes en AWS

## 1. Introducción

En este laboratorio trabajé con Amazon S3, un servicio de AWS que permite almacenar archivos en la nube. El objetivo fue aprender a crear un bucket, subir imágenes, consultar los objetos almacenados y conectar el almacenamiento con una aplicación desarrollada en Node.js.

También trabajé con AWS Lambda para implementar la generación automática de miniaturas y con las etiquetas de objetos para guardar información adicional sobre las imágenes.

## 2. Objetivos

- Crear un bucket en Amazon S3 para almacenar imágenes.
- Subir, listar y consultar archivos desde la consola de AWS.
- Configurar permisos para mantener los archivos privados.
- Conectar una aplicación Node.js con Amazon S3.
- Utilizar etiquetas para clasificar las imágenes.
- Configurar una función Lambda para generar miniaturas automáticamente.

## 3. Herramientas utilizadas

- **Amazon S3:** almacenamiento de imágenes en la nube.
- **AWS Lambda:** ejecución automática de código cuando ocurre un evento.
- **Node.js y Express:** desarrollo del servidor de la aplicación.
- **AWS SDK para JavaScript:** comunicación entre Node.js y los servicios de AWS.
- **Python y Pillow:** procesamiento y redimensionamiento de imágenes en Lambda.
- **Visual Studio Code:** edición de los archivos del proyecto.
- **Git y GitHub:** control de versiones y publicación del código.

## 4. Desarrollo del laboratorio

### 4.1. Creación del bucket S3

Primero creé un bucket en Amazon S3 con el nombre `lab-09-vargas-20261014-kv529`, en la región `us-east-1`.

Este bucket funciona como repositorio para guardar las imágenes originales. Para mantener la seguridad, conservé el acceso público bloqueado y configuré el cifrado del lado del servidor.

### 4.2. Organización de las imágenes

Organicé los archivos utilizando dos prefijos principales:

- `originales/`: contiene las imágenes que se suben inicialmente.
- `miniaturas/`: se utiliza para almacenar las versiones reducidas de las imágenes.

Esta organización permite identificar los archivos originales y diferenciarlos de las miniaturas.

### 4.3. Integración con Node.js

Desarrollé un servidor utilizando Node.js y Express para comunicar la aplicación con Amazon S3.

El servidor permite consultar las imágenes almacenadas y realizar operaciones relacionadas con ellas. Para conectarse a AWS se utiliza el SDK correspondiente.

La configuración de la aplicación se realiza mediante variables de entorno para evitar colocar información sensible directamente en el código.

### 4.4. Etiquetas de objetos S3

También implementé una funcionalidad para guardar etiquetas en las imágenes. Estas etiquetas permiten registrar información adicional, como el proyecto y el cliente relacionado con cada archivo.

Por ejemplo, una imagen puede tener las siguientes etiquetas:

- `proyecto`: Kusi
- `cliente`: ClienteA

Implementé endpoints para registrar y consultar estas etiquetas mediante las operaciones de etiquetado de objetos de S3.

### 4.5. Generación automática de miniaturas con Lambda

Creé una función Lambda llamada `generar-miniaturas-s3`, desarrollada en Python y utilizando la biblioteca Pillow para procesar las imágenes.

La función está preparada para realizar las siguientes operaciones:

1. Recibir un evento generado por la creación de un objeto en S3.
2. Identificar la imagen dentro del prefijo `originales/`.
3. Descargar la imagen original.
4. Reducir sus dimensiones a un máximo de 300 × 300 píxeles.
5. Convertir la imagen procesada a formato JPEG.
6. Guardar la miniatura dentro de `miniaturas/`.

Configuré un desencadenador de S3 para detectar eventos de creación de objetos. La comprobación final consiste en subir una imagen nueva y verificar que su miniatura se genere correctamente.

### 4.6. Seguridad del almacenamiento

Durante el desarrollo consideré algunas medidas de seguridad:

- Mantener bloqueado el acceso público al bucket.
- Utilizar cifrado para los objetos almacenados.
- Limitar los permisos de la función Lambda a las operaciones necesarias.
- Evitar publicar archivos `.env` y credenciales de AWS en GitHub.
- Utilizar HTTPS para proteger las comunicaciones cuando corresponda.

## 5. Resultados obtenidos

Durante el laboratorio realicé las siguientes actividades:

- Creé el bucket de Amazon S3.
- Subí y consulté imágenes almacenadas.
- Configuré las medidas básicas de seguridad del bucket.
- Integré el servidor Node.js con S3.
- Implementé el registro y la consulta de etiquetas de objetos.
- Creé la función Lambda y configuré el desencadenador de S3 para la generación de miniaturas.

La generación automática se debe comprobar con una imagen real para confirmar que la función y sus permisos trabajan correctamente.

## 6. Conclusiones

1. Amazon S3 permite guardar archivos en la nube y acceder a ellos mediante diferentes servicios de AWS.
2. La integración con Node.js facilita la administración de imágenes desde una aplicación web.
3. Las etiquetas de S3 permiten organizar y clasificar los archivos sin modificar su contenido original.
4. AWS Lambda permite automatizar tareas cuando se producen eventos, como la subida de imágenes.
5. La seguridad es importante al trabajar con servicios en la nube, por lo que es necesario controlar los permisos y proteger las credenciales.

## 7. Mejoras futuras

Como mejoras futuras, se podría implementar el inicio de sesión con Amazon Cognito para controlar el acceso de los usuarios a sus imágenes y publicar el frontend mediante Amazon S3 y CloudFront con HTTPS.

## 8. Autor

**Estudiante:** Jhon Kevin Jesus Vargas Choque  
**Curso:** Desarrollo de soluciones en la nube  
**Institución:** TECSUP

