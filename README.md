# Excusas Jeans - Catálogo de Productos

Un catálogo moderno y elegante para mostrar productos de jeans con integración de WhatsApp para realizar pedidos.

## 🚀 Características

- **Catálogo de Productos**: Muestra una colección de jeans con diferentes estilos
- **Integración WhatsApp**: Los clientes pueden enviar pedidos directamente por WhatsApp
- **Responsive Design**: Optimizado para móviles y desktop
- **Filtros y Búsqueda**: Sistema de filtros por categoría, talla, color y precio
- **Carrito de Compras**: Agregar productos al carrito antes de enviar por WhatsApp
- **Diseño Moderno**: Interfaz inspirada en marcas como H&M y Zara

## 🛠️ Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **Lucide React** - Iconos
- **Radix UI** - Componentes de interfaz

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd excusas-jeans
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 🎯 Funcionalidades

### Catálogo de Productos
- Vista de grid con productos
- Filtros por categoría, talla, color y precio
- Ordenamiento por relevancia, precio y fecha
- Paginación

### Detalle de Producto
- Galería de imágenes
- Selección de color y talla
- Información detallada del producto
- Botón de agregar al carrito

### Carrito de Compras
- Agregar/quitar productos
- Modificar cantidades
- Calcular total
- Enviar pedido por WhatsApp

### WhatsApp Integration
- Botón flotante de WhatsApp
- Generación automática de mensajes con detalles del pedido
- Enlace directo a WhatsApp con el mensaje pre-escrito

## 📱 Datos de Ejemplo

El catálogo incluye productos de ejemplo con:
- 6 productos diferentes de jeans
- Varios colores y tallas
- Precios en euros
- Imágenes de ejemplo

## 🎨 Personalización

### Agregar Nuevos Productos
Edita el archivo `src/data/productos.ts` para agregar nuevos productos:

```typescript
{
  id: "nuevo-id",
  nombre: "Nombre del Producto",
  slug: "nombre-del-producto",
  descripcion: "Descripción del producto",
  precio: 49.99,
  estado: "activo",
  // ... más propiedades
}
```

### Modificar Estilos
Los estilos están en `src/app/globals.css` y utilizan Tailwind CSS.

### Cambiar Información de Contacto
Modifica el número de WhatsApp en los componentes de WhatsApp.

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es un proyecto Next.js
3. El despliegue será automático

### Otros Proveedores
El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📄 Estructura del Proyecto

```
src/
├── app/                 # Páginas de Next.js
├── components/          # Componentes reutilizables
├── data/               # Datos de ejemplo
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades
└── public/             # Archivos estáticos
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte o preguntas, contacta por WhatsApp.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.
