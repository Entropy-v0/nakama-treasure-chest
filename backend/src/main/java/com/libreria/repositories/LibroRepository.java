package com.libreria.repositories;

import com.libreria.models.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {
    List<Libro> findByUsuarioId(Long usuarioId);
    List<Libro> findByUsuarioIdAndColeccionId(Long usuarioId, Long coleccionId);
}