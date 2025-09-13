# Guía de Implementación - Página de Perfil

## 📋 Pasos para Implementar la Página de Perfil

### 1. **Actualizar Base de Datos en Supabase**

#### Paso 1.1: Ejecutar SQL de Actualización
1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `database_update.sql`
4. Ejecuta el script

```sql
-- El script agregará estas columnas a la tabla usuarios:
- dni VARCHAR(8)
- provincia VARCHAR(100)
- distrito VARCHAR(100)
- direccion TEXT
- referencia TEXT
- codigo_postal VARCHAR(10)
- empresa_envio VARCHAR(50)
- sede_envio TEXT
```

#### Paso 1.2: Verificar la Actualización
Después de ejecutar el SQL, verifica que las columnas se agregaron correctamente:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 2. **Actualizar Políticas de Seguridad (RLS)**

#### Paso 2.1: Verificar RLS
Asegúrate de que Row Level Security esté habilitado:

```sql
-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios';
```

#### Paso 2.2: Crear/Actualizar Políticas
```sql
-- Política para que los usuarios solo puedan ver y editar sus propios datos
CREATE POLICY "Users can view own profile" ON usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Si no existe la política de INSERT para registro
CREATE POLICY "Users can insert own profile" ON usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. **Probar la Funcionalidad**

#### Paso 3.1: Datos de Prueba (Opcional)
Si quieres probar con datos de ejemplo, ejecuta `sample_data.sql` en el SQL Editor.

#### Paso 3.2: Probar la Aplicación
1. Inicia el servidor de desarrollo: `npm run dev`
2. Regístrate o inicia sesión con un usuario
3. Haz clic en tu nombre en el header
4. Completa el formulario de perfil
5. Verifica que los datos se guarden correctamente

### 4. **Verificar Funcionalidades**

#### ✅ Checklist de Verificación

**Información Personal:**
- [ ] Nombre se guarda correctamente
- [ ] Email es de solo lectura
- [ ] Celular se valida y guarda
- [ ] DNI se valida (máximo 8 dígitos)

**Dirección de Lima:**
- [ ] Al seleccionar Lima, aparece el dropdown de distritos
- [ ] Todos los distritos de Lima están disponibles
- [ ] Campos de dirección, referencia y código postal aparecen
- [ ] Los datos se guardan correctamente

**Dirección de Provincia:**
- [ ] Al seleccionar otra provincia, aparecen las empresas de envío
- [ ] Dropdown con Shalom, Marivsur, Flores funciona
- [ ] Campo de sede de envío aparece y se valida
- [ ] Los datos se guardan correctamente

**Navegación:**
- [ ] Enlace en el header funciona
- [ ] Botón "Volver" funciona
- [ ] Redirección a login si no está autenticado

**Estados:**
- [ ] Loading state durante el guardado
- [ ] Mensajes de éxito/error aparecen
- [ ] Validación de campos requeridos funciona

### 5. **Posibles Problemas y Soluciones**

#### Problema: Error de permisos en Supabase
**Solución:** Verificar que las políticas RLS estén configuradas correctamente

#### Problema: Campos no se guardan
**Solución:** Verificar que las columnas existan en la base de datos

#### Problema: Usuario no puede acceder al perfil
**Solución:** Verificar que el usuario esté autenticado y tenga permisos

#### Problema: Formulario no se actualiza dinámicamente
**Solución:** Verificar que los estados de React estén funcionando correctamente

### 6. **Estructura de Archivos Creados/Modificados**

```
src/
├── app/
│   └── perfil/
│       └── page.tsx          # Nueva página de perfil
├── components/
│   └── header.tsx            # Modificado - enlace al perfil
└── types/
    └── user.ts               # Modificado - nuevos campos

database_update.sql           # SQL para actualizar BD
sample_data.sql              # Datos de prueba
IMPLEMENTATION_GUIDE.md      # Esta guía
```

### 7. **Próximos Pasos Sugeridos**

1. **Validaciones Adicionales:**
   - Validar formato de DNI peruano
   - Validar formato de teléfono peruano
   - Validar códigos postales por distrito

2. **Mejoras de UX:**
   - Autocompletado de direcciones
   - Mapa para seleccionar ubicación
   - Historial de direcciones

3. **Integración con Envíos:**
   - Calcular costos de envío por provincia
   - Integrar con APIs de empresas de envío
   - Tracking de pedidos

### 8. **Comandos Útiles**

```bash
# Verificar que no hay errores de TypeScript
npm run build

# Verificar linting
npm run lint

# Iniciar desarrollo
npm run dev
```

---

**Nota:** Después de ejecutar el SQL de actualización, todos los usuarios existentes tendrán valores `NULL` en los nuevos campos, lo cual es correcto ya que pueden completarlos cuando accedan a su perfil.
