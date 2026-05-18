package com.libreria.services;

import com.libreria.models.Libro;
import com.libreria.repositories.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LibroService {

    private final LibroRepository libroRepository;

    @Autowired
    public LibroService(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    public List<Libro> obtenerTodos() {
        return libroRepository.findAll();
    }

    public Optional<Libro> obtenerPorId(Long id) {
        return libroRepository.findById(id);
    }

    public Libro guardarLibro(Libro libro) {

        if (!libro.isLeido()) {
            libro.setCalificacion(0);
            libro.setReseniaPersonal("");
        }

        if (libro.isLeido() && (libro.getCalificacion() < 1 || libro.getCalificacion() > 5)) {
            throw new IllegalArgumentException("La calificación debe estar entre 1 y 5 estrellas");
        }

        if (libro.isLeido() && (libro.getReseniaPersonal() == null || libro.getReseniaPersonal().trim().isEmpty())) {
            throw new IllegalArgumentException("La reseña no puede estar vacía si el libro está leído");
        }

        // Aquí podemos agregar más validaciones si es necesario
        // Por ejemplo: validación de ISBN, longitud del título, etc.

        return libroRepository.save(libro);
    }

    public void eliminarLibro(Long id) {
        libroRepository.deleteById(id);
    }
}
