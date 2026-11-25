package projetinho.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projetinho.demo.entity.ItemCadastrado;

import java.util.List;

public interface ItemCadastradoRepository extends JpaRepository<ItemCadastrado, Long> {
    List<ItemCadastrado> findByUsuarioId(Long usuarioId);
    List<ItemCadastrado> findByUsuarioIdIsNull();
}
