package projetinho.demo.entity;


import jakarta.persistence.*;

@Entity
public class ItemCadastrado {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long idLote;

    private String nome;

    private Double valorPago;

    private Double valorVenda;

    private Boolean status;

    @Column(length = 500)
    private String img;

    @Column(name = "usuario_id")
    private Long usuarioId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Long getIdLote() {
        return idLote;
    }

    public void setIdLote(Long idLote) {
        this.idLote = idLote;
    }

    public Double getValorPago() {
        return valorPago;
    }

    public void setValorPago(Double valorPago) {
        this.valorPago = valorPago;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Double getValorVenda() {
        return valorVenda;
    }

    public void setValorVenda(Double valorVenda) {
        this.valorVenda = valorVenda;
    }

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}
