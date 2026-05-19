package com.libreria.controllers;

import java.util.List;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.libreria.models.Libro;
import com.libreria.services.LibroService;

@RestController
@RequestMapping("/api/libros")
public class LibroController {

    @Autowired
    private LibroService libroService;


    @PostMapping("/subir")
    public ResponseEntity<?> subirLibro(
            @RequestParam("file") MultipartFile archivo,
            @RequestParam("titulo") String titulo,
            @RequestParam("autor") String autor,
            @RequestParam("usuarioId") Long usuarioId) {
        
        
        if (archivo == null || archivo.isEmpty()) {
            return new ResponseEntity<>("Error: El archivo PDF es estrictamente obligatorio.", HttpStatus.BAD_REQUEST);
        }

        try {
           
            Libro libroGuardado = libroService.procesarYGuardarLibro(archivo, titulo, autor, usuarioId);
            return new ResponseEntity<>(libroGuardado, HttpStatus.CREATED);
            
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al escribir el archivo en el servidor: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR); 
        }
    }


    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Libro>> listarLibrosPorUsuario(@PathVariable Long usuarioId) {
        List<Libro> libros = libroService.listarPorUsuario(usuarioId);
        return new ResponseEntity<>(libros, HttpStatus.OK); // Status 200
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarMetadatosLibro(@PathVariable Long id, @RequestBody Libro datosNuevos) {
        try {
            Libro libroActualizado = libroService.actualizarLibro(id, datosNuevos);
            return new ResponseEntity<>(libroActualizado, HttpStatus.OK); // Status 200
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al procesar la actualización: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarLibro(@PathVariable Long id) {
        try {
            libroService.eliminarLibro(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Status 204 (Éxito, sin contenido que devolver)
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}