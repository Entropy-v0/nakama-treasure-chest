package com.libreria.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.libreria.models.Etiqueta;

@Repository
public interface EtiquetaRepository extends JpaRepository<Etiqueta, Long> {
    List<Etiqueta> findByUsuarioId(Long usuarioId);
}