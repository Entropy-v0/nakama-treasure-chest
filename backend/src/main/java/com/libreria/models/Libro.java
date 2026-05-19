package com.libreria.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "libros")
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(nullable = false, length = 150)
    private String autor;

    @Column(name = "ruta_pdf", nullable = false, length = 512)
    private String rutaPdf;

    @Column(name = "ruta_portada", length = 512)
    private String rutaPortada;

    @Column(name = "tamanio_bytes")
    private Long tamanioBytes;

    @Column(name = "pagina_actual")
    private Integer paginaActual = 0;

    @Column(length = 50)
    private String isbn;

    @Column(name = "paginas_totales")
    private int paginasTotales;

    @Column(nullable = false)
    private boolean leido = false;

    @Column(name = "calificacion")
    private int calificacion;

    @Column(name = "nota_personal", columnDefinition = "TEXT")
    private String notaPersonal;

    @Column(name = "fecha_subida")
    private LocalDateTime fechaSubida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coleccion_id", nullable = true)
    private Coleccion coleccion;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "libro_etiqueta",
        joinColumns = @JoinColumn(name = "libro_id"),
        inverseJoinColumns = @JoinColumn(name = "etiqueta_id")
    )
    private Set<Etiqueta> etiquetas = new HashSet<>();


    // ==========================================
    // CONSTRUCTORES
    // ==========================================

    public Libro() {
    }

    public Libro(Long id, String titulo, String autor, String rutaPdf, String rutaPortada, Long tamanioBytes, 
                 Integer paginaActual, String isbn, int paginasTotales, boolean leido, int calificacion, 
                 String notaPersonal, LocalDateTime fechaSubida, Usuario usuario, Coleccion coleccion, Set<Etiqueta> etiquetas) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.rutaPdf = rutaPdf;
        this.rutaPortada = rutaPortada;
        this.tamanioBytes = tamanioBytes;
        this.paginaActual = paginaActual;
        this.isbn = isbn;
        this.paginasTotales = paginasTotales;
        this.leido = leido;
        this.calificacion = calificacion;
        this.notaPersonal = notaPersonal;
        this.fechaSubida = fechaSubida;
        this.usuario = usuario;
        this.coleccion = coleccion;
        this.etiquetas = etiquetas;
    }

    // ==========================================
    // GETTERS Y SETTERS
    // ==========================================

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo;}

    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getAutor() { return autor; }

    public void setAutor(String autor) { this.autor = autor; }

    public String getRutaPdf() { return rutaPdf; }

    public void setRutaPdf(String rutaPdf) { this.rutaPdf = rutaPdf;}

    public String getRutaPortada() { return rutaPortada; }

    public void setRutaPortada(String rutaPortada) { this.rutaPortada = rutaPortada; }

    public Long getTamanioBytes() { return tamanioBytes; }

    public void setTamanioBytes(Long tamanioBytes) { this.tamanioBytes = tamanioBytes; }

    public Integer getPaginaActual() { return paginaActual;}

    public void setPaginaActual(Integer paginaActual) { this.paginaActual = paginaActual;}

    public String getIsbn() { return isbn; }

    public void setIsbn(String isbn) { this.isbn = isbn; }

    public int getPaginasTotales() { return paginasTotales; }

    public void setPaginasTotales(int paginasTotales) { this.paginasTotales = paginasTotales; }

    public boolean isLeido() { return leido;}

    public void setLeido(boolean leido) { this.leido = leido;}

    public int getCalificacion() { return calificacion; }

    public void setCalificacion(int calificacion) { this.calificacion = calificacion; }

    public String getNotaPersonal() { return notaPersonal;}

    public void setNotaPersonal(String notaPersonal) { this.notaPersonal = notaPersonal; }

    public LocalDateTime getFechaSubida() { return fechaSubida;}

    public Usuario getUsuario() { return usuario;}

    public void setUsuario(Usuario usuario) {this.usuario = usuario;}

    public Coleccion getColeccion() {return coleccion;}

    public void setColeccion(Coleccion coleccion) {this.coleccion = coleccion;}

    public Set<Etiqueta> getEtiquetas() {return etiquetas;}

    public void setEtiquetas(Set<Etiqueta> etiquetas) {this.etiquetas = etiquetas;}

    @PrePersist
    protected void onCreate() {
        this.fechaSubida = LocalDateTime.now();
    }


}