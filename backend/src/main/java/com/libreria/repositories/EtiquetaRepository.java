package com.libreria.repositories;

import com.libreria.models.Etiqueta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EtiquetaRepository extends JpaRepository<Etiqueta, Long> {
    List<Etiqueta> findByUsuarioId(Long usuarioId);
}