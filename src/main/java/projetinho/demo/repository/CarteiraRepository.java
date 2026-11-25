package projetinho.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projetinho.demo.entity.Carteira;

import java.util.List;

public interface CarteiraRepository extends JpaRepository<Carteira, Long> {
    List<Carteira> findByUsuarioId(Long usuarioId);
    List<Carteira> findByUsuarioIdIsNull();
}
