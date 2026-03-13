# 🖼️ Public — Archivos Estáticos

## 🧑‍💼 ¿Qué es esta carpeta? (Explicación para no técnicos)

> Imagina la **vitrina de una tienda**: lo que pones ahí se ve directamente desde la calle, sin pasar por el mostrador ni preguntar a nadie. Los archivos de esta carpeta funcionan igual — se sirven directamente al navegador tal cual, sin ningún procesamiento.
>
> Si pones una imagen aquí, cualquiera puede acceder a ella directamente escribiendo `tudominio.com/nombre-imagen.png`.

---

## 📋 ¿Qué hay dentro?

| Archivo | Qué es | URL de acceso directo |
|---------|--------|----------------------|
| `Logo Giasat.png` | El logo de GIASAT usado en la cabecera de la web app | `tudominio.com/Logo%20Giasat.png` |

---

## 🎓 ¿Qué aprenderás aquí?

1. **La diferencia entre "estático" y "dinámico":**
   - **Estático:** No cambia. Una imagen, un favicon, un PDF. Siempre es el mismo archivo para todos los usuarios.
   - **Dinámico:** Cambia según quién la mire. La página de perfil muestra datos DIFERENTES para cada cooperativa.
   
   Los archivos de `public/` son siempre estáticos. El contenido generado por React (páginas, formularios) es dinámico.

2. **Cómo añadir un nuevo archivo estático:**
   ```
   Paso 1: Coloca el archivo en esta carpeta (ej: logo-nuevo.png)
   Paso 2: En el código, referéncialo como: /logo-nuevo.png
   Paso 3: Next.js lo sirve automáticamente. No hay que configurar nada.
   ```

3. **Qué es un "Favicon":** Es el iconito pequeño que aparece en la pestaña del navegador (al lado del título). Si quieres cambiarlo, pon un archivo `favicon.ico` aquí.
