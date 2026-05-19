package com.libreria.services; // Tu paquete original

import com.libreria.models.Libro;
import com.libreria.models.Usuario;
import com.libreria.repositories.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class LibroService { // Es la clase directa, sin implementar interfaces

    @Autowired
    private LibroRepository libroRepository;

    // Directorio local donde se guardarán los PDFs físicamente
    private final String DIRECTORIO_UPLOADS = "uploads/";

    public Libro procesarYGuardarLibro(MultipartFile archivo, String titulo, String autor, Long usuarioId) throws IOException {
        
        // 1. Validaciones básicas
        if (titulo == null || titulo.trim().isEmpty()) throw new IllegalArgumentException("El título es obligatorio.");
        if (autor == null || autor.trim().isEmpty()) throw new IllegalArgumentException("El autor es obligatorio.");
        if (usuarioId == null) throw new IllegalArgumentException("El ID de usuario es obligatorio.");

        // 2. Asegurar que la carpeta de subidas exista en el servidor
        Path directorioPath = Paths.get(DIRECTORIO_UPLOADS);
        if (!Files.exists(directorioPath)) {
            Files.createDirectories(directorioPath);
        }

        // 3. Generar un nombre único para el archivo para evitar que se sobreescriban si se llaman igual
        String nombreOriginal = archivo.getOriginalFilename();
        String nombreUnicoArchivo = UUID.randomUUID().toString() + "_" + nombreOriginal;
        Path rutaCompleta = directorioPath.resolve(nombreUnicoArchivo);

        // 4. Guardar el archivo físico en el disco
        Files.copy(archivo.getInputStream(), rutaCompleta);

        // 5. Crear la entidad Libro y asignarle los datos reales de tu modelo
        Libro nuevoLibro = new Libro();
        nuevoLibro.setTitulo(titulo);
        nuevoLibro.setAutor(autor);
        nuevoLibro.setRutaPdf(rutaCompleta.toString()); // Corregido: Usa tu propiedad 'rutaPdf'
        nuevoLibro.setTamanioBytes(archivo.getSize());   // Asignamos el tamaño en bytes que pide tu modelo

        // Corregido: Mapeamos la entidad Usuario pasando el ID
        Usuario usuarioAsociado = new Usuario();
        usuarioAsociado.setId(usuarioId); // Asegúrate de que tu modelo Usuario tenga el método setId
        nuevoLibro.setUsuario(usuarioAsociado);

        // 6. Guardar en la Base de Datos
        return libroRepository.save(nuevoLibro);
    }

    public List<Libro> listarPorUsuario(Long usuarioId) {
        return libroRepository.findByUsuarioId(usuarioId);
    }

    public Libro actualizarLibro(Long id, Libro datosNuevos) {
        // Buscar el libro existente o lanzar error si no existe
        Libro libroExistente = libroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Error: El libro con ID " + id + " no existe."));

        // Actualizar solo los metadatos permitidos (No cambiamos el archivo físico aquí)
        if (datosNuevos.getTitulo() != null && !datosNuevos.getTitulo().trim().isEmpty()) {
            libroExistente.setTitulo(datosNuevos.getTitulo());
        }
        if (datosNuevos.getAutor() != null && !datosNuevos.getAutor().trim().isEmpty()) {
            libroExistente.setAutor(datosNuevos.getAutor());
        }

        return libroRepository.save(libroExistente);
    }

    public void eliminarLibro(Long id) throws IOException {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("El libro no existe."));

        // 1. Intentar borrar el archivo físico del disco primero usando tu propiedad 'rutaPdf'
        if (libro.getRutaPdf() != null) {
            Path rutaArchivo = Paths.get(libro.getRutaPdf());
            Files.deleteIfExists(rutaArchivo);
        }

        // 2. Borrar el registro de la Base de Datos
        libroRepository.deleteById(id);
    }
}