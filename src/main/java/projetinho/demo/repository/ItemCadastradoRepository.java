package projetinho.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projetinho.demo.entity.ItemCadastrado;

public interface ItemCadastradoRepository extends JpaRepository<ItemCadastrado, Long> {
}
