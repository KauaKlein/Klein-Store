package projetinho.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import projetinho.demo.entity.ItemCadastrado;
import projetinho.demo.repository.ItemCadastradoRepository;

import java.util.List;

@Service
public class ItemCadastradoService {

    @Autowired
    ItemCadastradoRepository itemRepository;

    public ItemCadastrado salvar(ItemCadastrado item, Long usuarioId) {
        item.setId(null);
        item.setUsuarioId(usuarioId);
        return itemRepository.save(item);
    }

    public List<ItemCadastrado> listarTodos(Long usuarioId) {
        return itemRepository.findByUsuarioId(usuarioId);
    }

    public ItemCadastrado atualizar(Long id, ItemCadastrado novosDados, Long usuarioId) {
        ItemCadastrado itemExistente = itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado"));

        if (!usuarioId.equals(itemExistente.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para alterar este item");
        }

        itemExistente.setIdLote(novosDados.getIdLote());
        itemExistente.setNome(novosDados.getNome());
        itemExistente.setImg(novosDados.getImg());
        itemExistente.setValorPago(novosDados.getValorPago());
        itemExistente.setValorVenda(novosDados.getValorVenda());
        itemExistente.setStatus(novosDados.getStatus());
        return itemRepository.save(itemExistente);
    }

    public void deletar(Long id, Long usuarioId) {
        ItemCadastrado itemExistente = itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado"));

        if (!usuarioId.equals(itemExistente.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para excluir este item");
        }

        itemRepository.deleteById(id);
    }
}
