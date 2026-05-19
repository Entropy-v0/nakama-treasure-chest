package com.libreria.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.libreria.models.Libro;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {
    List<Libro> findByUsuarioId(Long usuarioId);
    List<Libro> findByUsuarioIdAndColeccionId(Long usuarioId, Long coleccionId);
}