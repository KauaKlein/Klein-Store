package projetinho.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import projetinho.demo.entity.ItemCadastrado;
import projetinho.demo.repository.ItemCadastradoRepository;

import java.util.List;

@Service
public class ItemCadastradoService {

    @Autowired
    ItemCadastradoRepository itemRepository;

    public ItemCadastrado salvar(ItemCadastrado item) {
        return itemRepository.save(item);
    }

    public List<ItemCadastrado> listarTodos() {
        return itemRepository.findAll();
    }

    public ItemCadastrado atualizar(Long id, ItemCadastrado novosDados) {
        ItemCadastrado itemExistente = itemRepository.findById(id).orElseThrow();

        itemExistente.setIdLote(novosDados.getIdLote());
        itemExistente.setNome(novosDados.getNome());
        itemExistente.setImg(novosDados.getImg());
        itemExistente.setValorPago(novosDados.getValorPago());
        itemExistente.setValorVenda(novosDados.getValorVenda());
        itemExistente.setStatus(novosDados.getStatus());
        return itemRepository.save(itemExistente);
    }

    public void deletar(Long id) {
        itemRepository.deleteById(id);
    }
}
