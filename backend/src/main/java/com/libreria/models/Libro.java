package com.libreria.models;

import jakarta.persistence.*;

@Entity
@Table(name = "libros")
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(nullable = false, length = 255)
    private String autor;

    @Column(length = 50)
    private String isbn;

    private int paginasTotales;

    @Column(nullable = false)
    private boolean leido;

    private int calificacion;

    @Column(columnDefinition = "TEXT")
    private String reseniaPersonal;

    public Libro() {
    }

    public Libro(Long id, String titulo, String autor, String isbn, int paginasTotales, boolean leido, int calificacion,
            String reseniaPersonal) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.isbn = isbn;
        this.paginasTotales = paginasTotales;
        this.leido = leido;
        this.calificacion = calificacion;
        this.reseniaPersonal = reseniaPersonal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public int getPaginasTotales() {
        return paginasTotales;
    }

    public void setPaginasTotales(int paginasTotales) {
        this.paginasTotales = paginasTotales;
    }

    public boolean isLeido() {
        return leido;
    }

    public void setLeido(boolean leido) {
        this.leido = leido;
    }

    public int getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(int calificacion) {
        this.calificacion = calificacion;
    }

    public String getReseniaPersonal() {
        return reseniaPersonal;
    }

    public void setReseniaPersonal(String reseniaPersonal) {
        this.reseniaPersonal = reseniaPersonal;
    }
}