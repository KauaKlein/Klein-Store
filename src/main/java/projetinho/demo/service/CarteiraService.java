package projetinho.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import projetinho.demo.entity.Carteira;
import projetinho.demo.repository.CarteiraRepository;

import java.util.List;

@Service
public class CarteiraService {

    @Autowired
    CarteiraRepository repository;

    public Carteira salvar(Carteira carteira, Long usuarioId) {
        carteira.setId(null);
        carteira.setUsuarioId(usuarioId);
        return repository.save(carteira);
    }

    public List<Carteira> listarTodos(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId);
    }

    public Carteira atualizar(Long id, Carteira novosDados, Long usuarioId) {
        Carteira existente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lançamento não encontrado"));

        if (!usuarioId.equals(existente.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para alterar este lançamento");
        }

        existente.setDescricao(novosDados.getDescricao());
        existente.setValor(novosDados.getValor());
        existente.setTipo(novosDados.getTipo());
        existente.setCategoria(novosDados.getCategoria());
        existente.setData(novosDados.getData());
        return repository.save(existente);
    }

    public void deletar(Long id, Long usuarioId) {
        Carteira existente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lançamento não encontrado"));

        if (!usuarioId.equals(existente.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para excluir este lançamento");
        }

        repository.deleteById(id);
    }
}
