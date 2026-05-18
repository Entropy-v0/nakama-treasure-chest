package com.libreria.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.libreria.models.Libro;
import com.libreria.services.LibroService;

@RestController
@RequestMapping("/api/libros")
public class LibroController {

    private final LibroService libroService;

    @Autowired
    public LibroController(LibroService libroService) {
        this.libroService = libroService;
    }

    @GetMapping
    public List<Libro> obtenerTodos() {
        return libroService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Libro> obtenerPorId(@PathVariable Long id) {
        Optional<Libro> libro = libroService.obtenerPorId(id);
        return libro.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearLibro(@RequestBody Libro libro) {
        try {
            Libro nuevoLibro = libroService.guardarLibro(libro);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoLibro);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Libro> actualizarLibro(@PathVariable Long id, @RequestBody Libro libro) {
        return libroService.obtenerPorId(id)
                .map(libroExistente -> {
                    libroExistente.setTitulo(libro.getTitulo());
                    libroExistente.setAutor(libro.getAutor());
                    libroExistente.setIsbn(libro.getIsbn());
                    libroExistente.setPaginasTotales(libro.getPaginasTotales());
                    libroExistente.setLeido(libro.isLeido());
                    libroExistente.setCalificacion(libro.getCalificacion());
                    libroExistente.setReseniaPersonal(libro.getReseniaPersonal());
                    return ResponseEntity.ok(libroService.guardarLibro(libroExistente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarLibro(@PathVariable Long id) {
        if (libroService.obtenerPorId(id).isPresent()) {
            libroService.eliminarLibro(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}